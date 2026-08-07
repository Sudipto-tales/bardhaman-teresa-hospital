<?php

/**
 * The contact page, and the appointment request form on it.
 *
 * The site takes no bookings — the form files an enquiry with
 * `source = appointment` and the desk calls back (docs/02-content-model.md
 * §19-20). It posts to POST api/public/enquiry, which is why the token is
 * issued here: the endpoint checks it, and a page that never minted one would
 * be a form nobody can send.
 *
 * A card elsewhere on the site links here as `contact?doctor=<slug>#book`.
 * That is resolved server-side into the two selects' values, so the form is
 * already filled in before assets/pages.js runs — and stays filled in for
 * somebody whose scripts never arrive. preselectDoctor() does the same work
 * client-side for the frozen html/ copy.
 */
class ContactController extends SiteController
{
    protected string $active = 'contact';

    public function index(): void
    {
        $page = page_by_slug('contact');
        $sections = $page['sections'] ?? [];

        $departments = departments_published();

        /* Only doctors who accept appointments: offering a name and then
           refusing the booking is worse than not listing them. */
        $doctors = array_values(array_filter(
            doctors_published(),
            static fn (array $doctor): bool => !empty($doctor['appointmentEnabled'])
        ));

        [$selectedDoctor, $selectedDepartment] = $this->preselection($doctors);

        $phone = site_primary_phone();
        $emergency = trim((string) setting('contact', 'emergencyNumber', ''));
        $whatsapp = site_digits((string) setting('contact', 'whatsapp', ''));

        $this->page('contact', [
            'head' => $this->seoHead('page', 'contact', [
                'title' => 'Contact',
                'description' => 'Book an appointment, ask a question, or come straight in. '
                    . 'Emergency and ambulance lines are staffed every hour of the year.',
            ]),

            'sections' => $sections,
            'reachUs' => page_section_data($page, 'reach-us'),
            'appointment' => page_section_data($page, 'appointment'),
            'location' => page_section_data($page, 'location'),
            'cta' => page_section_data($page, 'cta'),

            'departments' => $departments,
            'doctors' => $doctors,
            'selectedDoctor' => $selectedDoctor,
            'selectedDepartment' => $selectedDepartment,
            'csrf' => Csrf::token(),
            'action' => base_url('api/public/enquiry'),

            'phone' => $phone,
            'emergency' => $emergency !== ''
                ? ['number' => $emergency, 'digits' => site_digits($emergency)]
                : $phone,
            'email' => site_primary_email(),
            'whatsapp' => $whatsapp,
            'whatsappMessage' => (string) setting('contact', 'whatsappMessage', ''),
            'address' => site_address_lines(),
            'hours' => $this->openingHours(),
            'mapQuery' => $this->mapQuery(),
            'bannerImage' => media_url('reception-2025.jpg', $this->defaultImage()),
        ]);
    }

    /**
     * `?doctor=<slug>` resolved against the doctors the form actually offers.
     *
     * An unknown or non-bookable slug selects nothing rather than being
     * guessed at: a stale link should leave the form usable, not half-filled
     * with somebody the visitor did not choose.
     *
     * @return array{0: string, 1: string} The doctor slug, and their department
     */
    private function preselection(array $doctors): array
    {
        $wanted = trim((string) ($_GET['doctor'] ?? ''));

        if ($wanted === '') {
            return ['', ''];
        }

        foreach ($doctors as $doctor) {
            if ((string) ($doctor['id'] ?? '') !== $wanted) {
                continue;
            }

            /* The first department is the one they are listed under — the
               same rule form/enquiry uses to build the option's data-dept. */
            $department = (string) (($doctor['departments'] ?? [''])[0] ?? '');

            return [$wanted, $department];
        }

        return ['', ''];
    }

    /**
     * What the map iframe searches for.
     *
     * The address as the settings screen has it, so moving the hospital is
     * editing one field rather than finding a hard-coded query in a template.
     */
    private function mapQuery(): string
    {
        $lines = array_filter(array_map('trim', site_address_lines()));

        return $lines ? implode(', ', $lines) : 'Bardhaman, West Bengal 713101';
    }
}
