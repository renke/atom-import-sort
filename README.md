# atom-import-sort

Sort ES6 imports. Manually – or automatically when you save your Javascript files.

![Screencast](https://github.com/renke/atom-import-sort/blob/master/media/atom-import-sort.gif?raw=true)

This package does **not** sort `require` calls. Only ES6-style imports are supported as of now. Support for `require` may be added later, but it's generally harder to do this compared to imports.

# Installation

`apm install atom-import-sort`

# Usage

Use  <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>o</kbd> or the `Import Sort: Sort` command to sort imports on demand. Make sure you are actually editing a file that uses the `js` grammar (I highly recommend [language-babel](https://atom.io/packages/language-babel)).

Imports can also be sorted automatically on save when `Save on sort` is enabled in the package's settings. This is disabled by default because it's annoying at times.

# Sorting

The resulting order of imports is currently hardcoded into the package (although it's actually configurable in [import-sort](https://github.com/renke/import-sort)) and looks like:

```javascript
import "aaa";
import "bbb";

import "./aaa";
import "./bbb";

import _ from "xyz";
import a from "a"
import A from "A";
import B, {b} from "B";
import {C} from "C"

import __ from "./xyz"
import aa from "./a"
import AA from "./A";
import BB, {bb} from "./B";
import {CC} from "./C"
```

Eventually I want to support different layouts that can be chosen in the setting's page or on a per-project basis. Suggestions for other layouts are always welcome.

## License ##

See [LICENSE](LICENSE).
