<?php

/**
 * The three footer columns, as data.
 *
 * SiteController::footer() builds Community / About / Support from
 * nav_for_location('footer-1'|'footer-2'|'footer-3'). The defaults in
 * app/components/site/layout/footer.php only apply when a location returns no
 * rows at all — so on an installed database, editing that file changes
 * nothing and the old three-link footer stays on screen.
 *
 * database/seeds/nav_items.json carries the same rows for a fresh install,
 * but `php vayu seed` empties every table before filling it and regenerates
 * the admin password. That is not something to ask of a database with real
 * content in it. Hence this: the same eleven rows, written in place.
 *
 * Safe to run twice. Each row is matched on public_id and updated if present,
 * inserted if not.
 *
 * Nothing is deleted. A footer row someone added through the panel is their
 * row, not ours, and a migration that tidies away another person's work is a
 * migration that lost data. Extra rows can go from the Navigation screen.
 */
class FooterNavColumns extends Migration
{
    /** public_id, location, label, href, sort_order — the canonical set. */
    private const ROWS = [
        ['nav-020', 'footer-1', 'Doctors', '/doctors', 1],
        ['nav-021', 'footer-1', 'Testimonials', '/#testimonials', 2],
        ['nav-022', 'footer-1', 'Blogs', '/blog', 3],
        ['nav-023', 'footer-1', 'FAQ', '/#faq', 4],

        ['nav-030', 'footer-2', 'About Us', '/about', 1],
        ['nav-031', 'footer-2', 'Career', '/careers', 2],
        ['nav-032', 'footer-2', 'Facilities', '/facilities', 3],
        ['nav-033', 'footer-2', 'Departments', '/departments', 4],

        ['nav-050', 'footer-3', 'Terms & Conditions', '/terms', 1],
        /* The panel on the contact page, by id — the same target the mobile
           dock's ambulance button uses. */
        ['nav-051', 'footer-3', 'Emergency', '/contact#emergency', 2],
        ['nav-052', 'footer-3', 'Contact Us', '/contact', 3],
    ];

    public function up()
    {
        $find = $this->pdo->prepare('SELECT id FROM nav_items WHERE public_id = ?');

        /* deleted_at is cleared as well: nav_for_location() filters on it, so
           a row soft-deleted from the panel would be updated here and still
           never render — a migration that reports success and changes
           nothing on screen. */
        $update = $this->pdo->prepare(
            'UPDATE nav_items
                SET location = ?, label = ?, href = ?, sort_order = ?,
                    parent_id = NULL, visible = 1, deleted_at = NULL
              WHERE public_id = ?'
        );

        $insert = $this->pdo->prepare(
            'INSERT INTO nav_items (public_id, location, label, href, icon, target, parent_id, sort_order, visible)
             VALUES (?, ?, ?, ?, NULL, NULL, NULL, ?, 1)'
        );

        foreach (self::ROWS as [$publicId, $location, $label, $href, $sort]) {
            $find->execute([$publicId]);

            if ($find->fetchColumn() !== false) {
                $update->execute([$location, $label, $href, $sort, $publicId]);
                continue;
            }

            $insert->execute([$publicId, $location, $label, $href, $sort]);
        }
    }

    /**
     * There is no previous state to restore to. The rows this replaces were
     * three departments and a stray About link seeded from the prototype;
     * putting them back would be inventing content, not reversing a schema
     * change. Said plainly rather than faked.
     */
    public function down()
    {
    }
}
