<?php

/**
 * The resource registry.
 *
 * Twenty CRUD screens, one controller. Everything that differs between them is
 * data, and this is the data: what table a resource lives in, what its public
 * key is called, which fields the API exposes and how each maps to a column,
 * what can be searched, filtered and sorted, what must be filled in before a
 * record may be published, and what blocks a delete.
 *
 * The panel is already written and is not changing (docs/php/06-decisions.md
 * §1), so the field names below are not a choice — they are what
 * assets/admin/js/pages/*.js reads. Every row the API returns has:
 *
 *     id          the public key, a slug or a d-001 style string
 *     order       sort position
 *     status      draft | published | hidden
 *     updatedAt   ISO 8601, and the value PATCH echoes back for concurrency
 *
 * This file is the exact inverse of the mapping in tools/seed-export.mjs. The
 * two are the only places in the codebase that know a column is called
 * `sort_order` and a field is called `order`.
 *
 * ---------------------------------------------------------------------------
 * Field types
 *
 *   string text      as stored
 *   int float        cast; '' becomes null, never 0
 *   bool             0/1 in the database, true/false in JSON
 *   json             a repeater, decoded on read and encoded on write
 *   csv              a JSON column the form edits as "a, b, c"
 *   date datetime    date is yyyy-mm-dd, datetime is ISO 8601 in JSON
 *   ref              a foreign key the API speaks in public keys
 *   join             a many-to-many, read and written as an array of keys
 *
 * A field written as a bare string is shorthand for that type with the column
 * named as the snake_case of the field.
 *
 * ---------------------------------------------------------------------------
 * Filter names
 *
 * The contract names a filter after the thing it selects (`department`); the
 * panel's list controller sends it under the name of the *field* it filters on
 * (`departmentId`), because that is what its column definition already knows.
 * Both spellings are registered wherever they differ, for the reason 4.5 gave
 * for `GET api/activity`: two names in the registry is one less special case in
 * api.js, and a filter that silently does nothing is the worst of the three
 * outcomes. Each alias carries a comment naming the screen that sends it.
 * ---------------------------------------------------------------------------
 */

return [

    /* =========================================================
       Content
       ========================================================= */

    'doctors' => [
        'table' => 'doctors',
        'key' => 'slug',
        'label' => 'name',
        'seo' => 'doctor',
        'search' => ['name', 'role', 'qualification', 'speciality'],
        'sort' => ['name', 'role', 'order', 'status', 'updatedAt', 'experienceYears', 'appointmentEnabled'],
        'fields' => [
            'name' => 'string',
            'role' => 'string',
            'qualification' => 'string',
            'experienceYears' => 'int',
            'photo' => 'string',
            'speciality' => 'string',
            'registrationNo' => 'string',
            /* The form is one text input; the column is an array. */
            'languages' => 'csv',
            'bio' => 'text',
            'schedule' => 'json',
            'consultationFee' => 'int',
            'rating' => 'float',
            'reviewCount' => 'int',
            'isLeadership' => 'bool',
            /* Not a booking flag. It decides whether the doctor card carries
               a link to the contact form; the site takes no bookings at all.
               See docs/02-content-model.md §20. */
            'appointmentEnabled' => ['type' => 'bool', 'default' => true],
            'departments' => [
                'type' => 'join',
                'table' => 'department_doctors',
                'local' => 'doctor_id',
                'foreign' => 'department_id',
                'target' => 'departments',
            ],
        ],
        'filters' => [
            'department' => ['type' => 'join', 'field' => 'departments'],
            /* doctors.js — the column is `departments`, so the filter is too. */
            'departments' => ['type' => 'join', 'field' => 'departments'],
            'isLeadership' => ['type' => 'bool'],
        ],
        'required' => ['name', 'role', 'qualification', 'photo'],
        'dependents' => [
            ['table' => 'posts', 'column' => 'author_id', 'label' => 'article', 'resource' => 'posts'],
            ['table' => 'leadership', 'column' => 'linked_doctor_id', 'label' => 'leadership entry', 'resource' => 'leadership'],
        ],
    ],

    'leadership' => [
        'table' => 'leadership',
        'key' => 'slug',
        'label' => 'name',
        'search' => ['name', 'title'],
        'sort' => ['name', 'title', 'order', 'status', 'updatedAt'],
        'fields' => [
            'name' => 'string',
            'title' => 'string',
            'photo' => 'string',
            'category' => ['type' => 'string', 'enum' => ['board', 'management', 'clinical-leadership']],
            'message' => 'text',
            'linkedDoctorId' => ['type' => 'ref', 'target' => 'doctors'],
        ],
        'filters' => ['category' => ['type' => 'string']],
        'required' => ['name', 'title', 'photo'],
    ],

    'departments' => [
        'table' => 'departments',
        'key' => 'slug',
        'label' => 'name',
        'seo' => 'department',
        'search' => ['name', 'lead', 'menuNote'],
        'sort' => ['name', 'order', 'status', 'updatedAt'],
        'fields' => [
            'name' => 'string',
            'icon' => 'string',
            'menuNote' => 'string',
            'showInMenu' => ['type' => 'bool', 'default' => true],
            'banner' => 'string',
            'titleLead' => 'string',
            'titleStrong' => 'string',
            'lead' => 'text',
            'chips' => 'json',
            'primaryCta' => 'json',
            'ghostCta' => 'json',
            'introTitle' => 'string',
            'introBody' => 'json',
            'checks' => 'json',
            'introImg' => 'string',
            'badge' => 'json',
            'procedures' => 'json',
            'conditionsTitle' => 'string',
            'conditionsLead' => 'text',
            'conditions' => 'json',
            'doctorIds' => [
                'type' => 'join',
                'table' => 'department_doctors',
                'local' => 'department_id',
                'foreign' => 'doctor_id',
                'target' => 'doctors',
            ],
        ],
        'filters' => ['showInMenu' => ['type' => 'bool']],
        'required' => ['name', 'icon', 'titleStrong', 'lead'],
        'dependents' => [
            ['table' => 'department_doctors', 'column' => 'department_id', 'label' => 'doctor',
                'far' => 'doctor_id', 'farResource' => 'doctors'],
            ['table' => 'testimonials', 'column' => 'department_id', 'label' => 'testimonial', 'resource' => 'testimonials'],
            ['table' => 'faqs', 'column' => 'department_id', 'label' => 'FAQ', 'resource' => 'faqs'],
            ['table' => 'counters', 'column' => 'department_id', 'label' => 'counter', 'resource' => 'counters'],
            ['table' => 'enquiries', 'column' => 'department_id', 'label' => 'enquiry', 'resource' => 'enquiries'],
        ],
    ],

    'facilities' => [
        'table' => 'facilities',
        'key' => 'slug',
        'label' => 'title',
        'search' => ['title', 'text'],
        'sort' => ['title', 'order', 'status', 'updatedAt'],
        'fields' => [
            'icon' => 'string',
            'title' => 'string',
            'text' => 'text',
            'image' => 'string',
        ],
        'required' => ['icon', 'title', 'text'],
    ],

    /* The public gallery — /gallery, and the `gallery-items` screen.
       Distinct from `media`, which is the asset library every picker reads
       (GET api/media, its own controller): this is the curated wall.

       `videoPath` is written by POST api/gallery/video and never typed. The
       upload endpoint transcodes, extracts a poster and probes the result, and
       the form saves what it hands back — which is why `duration` and
       `sizeBytes` are ordinary fields rather than anything derived here. */
    'gallery' => [
        'table' => 'gallery',
        'key' => 'slug',
        'label' => 'title',
        'search' => ['title', 'caption', 'album'],
        'sort' => ['title', 'album', 'order', 'status', 'updatedAt'],
        'fields' => [
            'type' => ['type' => 'string', 'enum' => ['image', 'video', 'youtube']],
            'album' => 'string',
            'title' => 'string',
            'caption' => 'text',
            'image' => 'string',
            'videoPath' => 'string',
            'youtubeId' => 'string',
            'duration' => 'int',
            'sizeBytes' => 'int',
        ],
        'filters' => [
            'type' => ['type' => 'string'],
            'album' => ['type' => 'string'],
        ],
        'required' => ['title'],
    ],

    'lab-tests' => [
        'table' => 'lab_tests',
        'key' => 'slug',
        'label' => 'name',
        'search' => ['name', 'description'],
        'sort' => ['name', 'price', 'order', 'status', 'updatedAt'],
        'fields' => [
            'name' => 'string',
            'category' => ['type' => 'string', 'enum' => ['test', 'package']],
            'icon' => 'string',
            'description' => 'text',
            'includes' => 'json',
            'price' => 'int',
            'discountPrice' => 'int',
            'prepInstructions' => 'text',
            'reportTime' => 'string',
            'homeCollection' => 'bool',
            'featured' => 'bool',
        ],
        'filters' => [
            'category' => ['type' => 'string'],
            'featured' => ['type' => 'bool'],
            /* lab-tests.js — the screen filters on it, so the server can. */
            'homeCollection' => ['type' => 'bool'],
        ],
        'required' => ['name'],
    ],

    /* =========================================================
       Blog
       ========================================================= */

    'posts' => [
        'table' => 'posts',
        'key' => 'slug',
        'label' => 'title',
        'seo' => 'post',
        'search' => ['title', 'excerpt', 'heading'],
        'sort' => ['title', 'publishedAt', 'views', 'order', 'status', 'updatedAt'],
        'fields' => [
            'title' => 'string',
            'heading' => 'string',
            'excerpt' => 'text',
            'body' => 'text',
            'coverImage' => 'string',
            'categoryId' => ['type' => 'ref', 'target' => 'categories'],
            'authorId' => ['type' => 'ref', 'target' => 'doctors'],
            'readMinutes' => 'int',
            'publishedAt' => 'datetime',
            'featured' => 'bool',
            'views' => ['type' => 'int', 'readonly' => true],
            'tags' => [
                'type' => 'join',
                'table' => 'post_tags',
                'local' => 'post_id',
                'foreign' => 'category_id',
                'target' => 'categories',
            ],
        ],
        'filters' => [
            'category' => ['type' => 'ref', 'column' => 'category_id', 'target' => 'categories'],
            'author' => ['type' => 'ref', 'column' => 'author_id', 'target' => 'doctors'],
            /* blog.js */
            'categoryId' => ['type' => 'ref', 'column' => 'category_id', 'target' => 'categories'],
            'authorId' => ['type' => 'ref', 'column' => 'author_id', 'target' => 'doctors'],
            'tag' => ['type' => 'join', 'field' => 'tags'],
            'featured' => ['type' => 'bool'],
            'from' => ['type' => 'dateFrom', 'column' => 'published_at'],
            'to' => ['type' => 'dateTo', 'column' => 'published_at'],
        ],
        'required' => ['title', 'excerpt', 'body', 'coverImage', 'categoryId', 'authorId'],
    ],

    'categories' => [
        'table' => 'categories',
        'key' => 'slug',
        'label' => 'name',
        'search' => ['name', 'description'],
        'sort' => ['name', 'type', 'order'],
        'fields' => [
            'name' => 'string',
            'type' => ['type' => 'string', 'enum' => ['category', 'tag'], 'default' => 'category'],
            'description' => 'string',
        ],
        'filters' => ['type' => ['type' => 'string']],
        'required' => ['name'],
        'dependents' => [
            ['table' => 'posts', 'column' => 'category_id', 'label' => 'article', 'resource' => 'posts'],
            ['table' => 'post_tags', 'column' => 'category_id', 'label' => 'tagged article',
                'far' => 'post_id', 'farResource' => 'posts'],
        ],
    ],

    /* =========================================================
       Social proof and support content
       ========================================================= */

    'testimonials' => [
        'table' => 'testimonials',
        'key' => 'public_id',
        'label' => 'name',
        'search' => ['name', 'text', 'role'],
        'sort' => ['name', 'rating', 'order', 'status', 'updatedAt'],
        'fields' => [
            'text' => 'text',
            'name' => 'string',
            'role' => 'string',
            'photo' => 'string',
            'rating' => 'int',
            'departmentId' => ['type' => 'ref', 'target' => 'departments'],
            'source' => ['type' => 'string', 'enum' => ['website', 'google', 'manual'], 'default' => 'manual'],
            'featured' => 'bool',
        ],
        'filters' => ['source' => ['type' => 'string'], 'featured' => ['type' => 'bool']],
        'required' => ['text', 'name'],
    ],

    'faqs' => [
        'table' => 'faqs',
        'key' => 'public_id',
        'label' => 'question',
        'search' => ['question', 'answer'],
        'sort' => ['question', 'order', 'status', 'updatedAt'],
        'fields' => [
            'question' => 'string',
            'answer' => 'text',
            'group' => ['column' => 'faq_group', 'type' => 'string', 'enum' => ['home', 'contact', 'department'], 'default' => 'home'],
            'departmentId' => ['type' => 'ref', 'target' => 'departments'],
        ],
        'filters' => ['group' => ['column' => 'faq_group', 'type' => 'string']],
        'required' => ['question', 'answer'],
    ],

    'counters' => [
        'table' => 'counters',
        'key' => 'public_id',
        'label' => 'label',
        'search' => ['label', 'key', 'note'],
        'sort' => ['label', 'scope', 'order'],
        'fields' => [
            'key' => ['column' => 'counter_key', 'type' => 'string'],
            'icon' => 'string',
            'label' => 'string',
            'value' => 'string',
            'suffix' => 'string',
            'note' => 'string',
            'scope' => ['type' => 'string', 'enum' => ['global', 'home', 'about', 'department'], 'default' => 'global'],
            'departmentId' => ['type' => 'ref', 'target' => 'departments'],
        ],
        'filters' => [
            'scope' => ['type' => 'string'],
            'department' => ['type' => 'ref', 'column' => 'department_id', 'target' => 'departments'],
        ],
        'required' => ['label', 'value'],
        'status' => false,
    ],

    /* =========================================================
       Structure
       ========================================================= */

    'nav-items' => [
        'table' => 'nav_items',
        'key' => 'public_id',
        'label' => 'label',
        'search' => ['label', 'href'],
        'sort' => ['label', 'location', 'order'],
        'fields' => [
            'location' => 'string',
            'label' => 'string',
            'href' => 'string',
            'icon' => 'string',
            'target' => 'string',
            'parentId' => ['type' => 'ref', 'target' => 'nav-items'],
            'visible' => ['type' => 'bool', 'default' => true],
        ],
        'filters' => ['location' => ['type' => 'string']],
        'required' => ['label', 'href'],
        'status' => false,
        'dependents' => [
            ['table' => 'nav_items', 'column' => 'parent_id', 'label' => 'child item', 'resource' => 'nav-items'],
        ],
    ],

    'redirects' => [
        'table' => 'redirects',
        'key' => 'public_id',
        'label' => 'from',
        'search' => ['from_path', 'to_path'],
        'sort' => ['from', 'hits', 'order'],
        'fields' => [
            'from' => ['column' => 'from_path', 'type' => 'string'],
            'to' => ['column' => 'to_path', 'type' => 'string'],
            'code' => ['type' => 'int', 'enum' => [301, 302], 'default' => 301],
            'hits' => ['type' => 'int', 'readonly' => true],
            'active' => ['type' => 'bool', 'default' => true],
        ],
        'required' => ['from', 'to'],
        'status' => false,
    ],

    /* =========================================================
       Careers and the inbox
       ========================================================= */

    'jobs' => [
        'table' => 'jobs',
        'key' => 'slug',
        'label' => 'title',
        'search' => ['title', 'dept', 'summary'],
        'sort' => ['title', 'dept', 'postedAt', 'closesAt', 'order', 'status', 'updatedAt'],
        'fields' => [
            'title' => 'string',
            'dept' => 'string',
            'type' => 'string',
            'location' => 'string',
            'experience' => 'string',
            'postedAt' => 'date',
            'closesAt' => 'date',
            'summary' => 'text',
            'responsibilities' => 'json',
            'requirements' => 'json',
            'benefits' => 'json',
            'niceToHave' => 'json',
            'salaryFrom' => 'int',
            'salaryTo' => 'int',
            'salaryNote' => 'string',
            'applyEmail' => 'string',
            'openings' => 'int',
        ],
        'filters' => [
            'dept' => ['type' => 'string'],
            'type' => ['type' => 'string'],
            'closingWithinDays' => ['type' => 'withinDays', 'column' => 'closes_at'],
        ],
        'required' => ['title', 'dept', 'closesAt', 'summary'],
        'dependents' => [
            ['table' => 'applications', 'column' => 'job_id', 'label' => 'application', 'resource' => 'applications'],
        ],
    ],

    /**
     * Applications are received, not authored. There is no create endpoint
     * here — POST /api/public/application is the only thing that writes one —
     * and the only editable fields are the panel's own pipeline.
     */
    'applications' => [
        'defaultSort' => 'appliedAt',
        'defaultDir' => 'desc',
        'table' => 'applications',
        'key' => 'public_id',
        'label' => 'name',
        'search' => ['name', 'email', 'phone', 'current_employer'],
        'sort' => ['name', 'appliedAt', 'stage', 'rating', 'order'],
        'create' => false,
        'fields' => [
            'jobId' => ['type' => 'ref', 'target' => 'jobs', 'readonly' => true],
            'jobTitle' => ['type' => 'string', 'readonly' => true],
            'name' => ['type' => 'string', 'readonly' => true],
            'email' => ['type' => 'string', 'readonly' => true],
            'phone' => ['type' => 'string', 'readonly' => true],
            'experience' => ['type' => 'string', 'readonly' => true],
            'currentEmployer' => ['type' => 'string', 'readonly' => true],
            'location' => ['type' => 'string', 'readonly' => true],
            'cvFile' => ['type' => 'string', 'readonly' => true],
            'coverNote' => ['type' => 'text', 'readonly' => true],
            'coverLetterFile' => ['type' => 'string', 'readonly' => true],
            /* The optional half of the form, as the applicant filled it in. */
            'details' => ['type' => 'json', 'readonly' => true],
            'appliedAt' => ['type' => 'datetime', 'readonly' => true],
            'notifiedAt' => ['type' => 'datetime', 'readonly' => true],
            /* The pipeline. Nothing on the public site can see it. */
            'stage' => ['type' => 'string', 'enum' => ['new', 'shortlisted', 'interview', 'offered', 'rejected'], 'default' => 'new'],
            'rating' => 'int',
            'notes' => 'json',
        ],
        'filters' => [
            'job' => ['type' => 'ref', 'column' => 'job_id', 'target' => 'jobs'],
            /* applications.js */
            'jobId' => ['type' => 'ref', 'column' => 'job_id', 'target' => 'jobs'],
            'stage' => ['type' => 'string'],
            'from' => ['type' => 'dateFrom', 'column' => 'applied_at'],
            'to' => ['type' => 'dateTo', 'column' => 'applied_at'],
        ],
        'status' => false,
    ],

    'enquiries' => [
        'defaultSort' => 'receivedAt',
        'defaultDir' => 'desc',
        'table' => 'enquiries',
        'key' => 'public_id',
        'label' => 'name',
        'search' => ['name', 'email', 'phone', 'subject', 'message'],
        'sort' => ['name', 'receivedAt', 'status', 'priority', 'order'],
        'create' => false,
        'fields' => [
            'name' => ['type' => 'string', 'readonly' => true],
            'email' => ['type' => 'string', 'readonly' => true],
            'phone' => ['type' => 'string', 'readonly' => true],
            'subject' => ['type' => 'string', 'readonly' => true],
            'message' => ['type' => 'text', 'readonly' => true],
            'source' => ['type' => 'string', 'readonly' => true],
            'departmentId' => ['type' => 'ref', 'target' => 'departments', 'readonly' => true],
            'doctorId' => ['type' => 'ref', 'target' => 'doctors', 'readonly' => true],
            'preferredDate' => ['type' => 'date', 'readonly' => true],
            /* What the visitor said would suit them. Not a booking — see
               docs/02-content-model.md §20. */
            'preferredSlot' => ['type' => 'string', 'readonly' => true],
            'receivedAt' => ['type' => 'datetime', 'readonly' => true],
            'assignedTo' => ['type' => 'ref', 'target' => 'users'],
            'priority' => ['type' => 'string', 'default' => 'normal'],
            'replies' => 'json',
            'internalNotes' => 'json',
        ],
        'filters' => [
            'source' => ['type' => 'string'],
            'assignedTo' => ['type' => 'ref', 'column' => 'assigned_to', 'target' => 'users'],
            'priority' => ['type' => 'string'],
            'from' => ['type' => 'dateFrom', 'column' => 'received_at'],
            'to' => ['type' => 'dateTo', 'column' => 'received_at'],
            /* enquiries.js. `window` is its "Received" control — the same
               three-option shape the activity log calls `withinDays`, under
               the name that screen gives it. */
            'departmentId' => ['type' => 'ref', 'column' => 'department_id', 'target' => 'departments'],
            'window' => ['type' => 'daysBack', 'column' => 'received_at'],
        ],
        /* Its own vocabulary — this is a workflow state, not a publish state. */
        'statusValues' => ['new', 'replied', 'closed', 'spam'],
    ],

    /**
     * Read-only, deliberately and completely.
     *
     * The hospital does not take bookings online. There is no create, no
     * update, no delete, no reorder and no bulk — a write endpoint here would
     * be an invitation to rebuild the workflow that was removed on purpose.
     * See docs/02-content-model.md §20 and docs/07-api-contract.md.
     */
    'appointments' => [
        'defaultSort' => 'preferredDate',
        'defaultDir' => 'desc',
        'table' => 'appointments',
        'key' => 'public_id',
        'label' => 'patientName',
        'readonly' => true,
        'search' => ['patient_name', 'phone', 'email', 'reason'],
        'sort' => ['patientName', 'preferredDate', 'status', 'createdAt'],
        'fields' => [
            'patientName' => 'string',
            'phone' => 'string',
            'email' => 'string',
            'departmentId' => ['type' => 'ref', 'target' => 'departments'],
            'doctorId' => ['type' => 'ref', 'target' => 'doctors'],
            'preferredDate' => 'date',
            'preferredSlot' => 'string',
            'reason' => 'text',
            'confirmedSlot' => 'string',
            'cancelReason' => 'string',
            'confirmedAt' => 'datetime',
        ],
        'filters' => [
            'department' => ['type' => 'ref', 'column' => 'department_id', 'target' => 'departments'],
            'doctor' => ['type' => 'ref', 'column' => 'doctor_id', 'target' => 'doctors'],
            'date' => ['type' => 'date', 'column' => 'preferred_date'],
            /* appointments.js. `when` is today / upcoming / past, which is the
               archive's only real question and has no date to be given. */
            'departmentId' => ['type' => 'ref', 'column' => 'department_id', 'target' => 'departments'],
            'doctorId' => ['type' => 'ref', 'column' => 'doctor_id', 'target' => 'doctors'],
            'preferredSlot' => ['type' => 'string'],
            'when' => ['type' => 'when', 'column' => 'preferred_date'],
        ],
        'statusValues' => ['pending', 'confirmed', 'cancelled', 'completed'],
    ],

    /* =========================================================
       System
       ========================================================= */

    'users' => [
        'table' => 'users',
        'key' => 'public_id',
        'label' => 'name',
        'search' => ['name', 'email', 'phone'],
        'sort' => ['name', 'email', 'lastActiveAt', 'order'],
        'fields' => [
            'name' => 'string',
            'email' => 'string',
            'roleId' => ['type' => 'ref', 'target' => 'roles'],
            'phone' => 'string',
            'avatar' => 'string',
            'twoFactor' => 'bool',
            'lastActiveAt' => ['type' => 'datetime', 'readonly' => true],
            /* The profile screen's preferences. `landingPage` is the screen
               `/admin` opens on — a bare screen name like `dashboard`, which
               AdminController checks against the shells on disk. */
            'landingPage' => 'string',
            'language' => 'string',
            'timezone' => 'string',
            'emailDigest' => 'string',
            /* Stamped by the server whenever `password` is written. */
            'passwordUpdatedAt' => ['type' => 'datetime', 'readonly' => true],
            /* Write-only: accepted on create and update, never returned. */
            'password' => ['type' => 'password', 'writeonly' => true],
        ],
        'filters' => ['roleId' => ['type' => 'ref', 'column' => 'role_id', 'target' => 'roles']],
        'required' => ['name', 'email'],
        'unique' => ['email'],
        'statusValues' => ['active', 'suspended', 'invited'],
    ],

    'roles' => [
        'table' => 'roles',
        'key' => 'public_id',
        'label' => 'name',
        'search' => ['name', 'description'],
        'sort' => ['name', 'order'],
        'fields' => [
            'name' => 'string',
            'description' => 'string',
            /* Stored, edited and displayed. Never checked — see
               docs/php/06-decisions.md §2. */
            'permissions' => 'json',
        ],
        'required' => ['name'],
        'status' => false,
        'dependents' => [
            ['table' => 'users', 'column' => 'role_id', 'label' => 'user', 'resource' => 'users'],
        ],
    ],
];
