<?php

/**
 * departments — §4. The largest record: one row fills one public page.
 * Replaces DEPARTMENTS in tools/site-data.mjs, 12 records driving 12 pages
 * plus the mega menu and departments.html.
 *
 * The repeaters — chips, intro paragraphs, tick list, procedure cards,
 * condition chips — are JSON columns. Each is edited as a block on one tab of
 * one form and rendered in one place; none is ever selected across rows. The
 * two that *are* queried get real tables: the team, below, and the animated
 * counters, which live in `counters` with scope = department (§13) so that
 * "640 beds" is one row wherever it appears rather than a number buried in a
 * JSON blob on one department.
 *
 * department_doctors is a real table because the relationship is read from
 * both ends: a department page lists its team, and a doctor card lists their
 * departments.
 */
class DepartmentsTable extends Migration
{
    public function up()
    {
        $this->create('departments', [
            $this->id(),
            'slug VARCHAR(191) NOT NULL',
            'name VARCHAR(160) NOT NULL',
            'icon VARCHAR(80)',
            'menu_note VARCHAR(160)',
            $this->bool('show_in_menu', true),

            'banner VARCHAR(500)',
            'title_lead VARCHAR(160)',
            'title_strong VARCHAR(160)',
            'lead TEXT',
            $this->json('chips'),
            $this->json('primary_cta'),
            $this->json('ghost_cta'),

            'intro_title VARCHAR(255)',
            $this->json('intro_body'),
            $this->json('checks'),
            'intro_img VARCHAR(500)',
            $this->json('badge'),

            $this->json('procedures'),

            'conditions_title VARCHAR(255)',
            'conditions_lead TEXT',
            $this->json('conditions'),

            'sort_order INT NOT NULL DEFAULT 0',
            "status VARCHAR(20) NOT NULL DEFAULT 'draft'",
            'updated_by INT',
            $this->timestamps(),
        ]);

        $this->index('departments', 'slug', true);
        $this->index('departments', 'status');

        /* CASCADE on both sides: a link row is meaningless once either end is
           gone, and leaving it behind would render a team strip with a hole
           in it. The application still refuses to delete a department that
           has doctors (409 HAS_DEPENDENTS) — this is the backstop for a
           delete that gets past it. */
        $this->create('department_doctors', [
            $this->id(),
            'department_id INT NOT NULL',
            'doctor_id INT NOT NULL',
            'sort_order INT NOT NULL DEFAULT 0',
            'FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE',
            'FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE',
        ]);

        $this->index('department_doctors', 'department_id, doctor_id', true);
        $this->index('department_doctors', 'doctor_id');
    }

    public function down()
    {
        $this->drop('department_doctors');
        $this->drop('departments');
    }
}
