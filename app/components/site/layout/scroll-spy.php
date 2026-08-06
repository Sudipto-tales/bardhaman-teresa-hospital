<?php

/* Deliberately empty: initSpy() in assets/website.js fills it from every
   [data-section] on the page, so a section added or removed needs no change
   here. Rendering the rail server-side would go stale the moment a block is
   hidden by its status column. */
?>
    <!-- ============ SCROLL-SPY RAIL (right, populated from [data-section]) ============ -->
    <nav class="spy" id="spy" aria-label="Section navigation"></nav>
