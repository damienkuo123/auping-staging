# RC7.6A.3.1 Known limitations

This emergency hotfix removes the newly introduced browser main-thread blocker.

A separate network-performance issue remains: the deployed homepage references
an autoplay MP4 of about 43 MB. It may still make the first uncached visit slow,
especially on mobile or slower connections. It should be optimized after this
blocking regression is removed.
