[![build status](https://secure.travis-ci.org/Metacrash/freshbooks.js.png)](http://travis-ci.org/Metacrash/freshbooks.js)
#Freshbooks.js

Freshbooks.js is a node.js module providing a wrapper to the [FreshBooks]
(http://www.freshbooks.com) API.

All API method are fairly well documented at [FreshBooks Developers]
(http://developers.freshbooks.com) but if you find a discrepancy between the 
docs and this wrapper feel free to file an "Issue".

## Installation

    $ npm install freshbooks
        
Note: This module utilises [libxmljs](https://github.com/polotek/libxmljs). You 
will need have the **libxml2** library installed and also the **libxml2-devel** 
(**libxml2-dev** on debian systems) package. This comes with the `xml2-config`
utility that is needed for compiling.  **This command must be in your path.**

## Example

    var FreshBooks = require("freshbooks");
    
    var freshbooks = new FreshBooks(api_url, api_token)
      , invoice = new freshbooks.Invoice();

    invoice.get(invoice_id, function(err, invoice) {
      if(err) { //returns if an error has occured, ie invoice_id doesn't exist.
        console.log(err);
      } else {
        console.log("Invoice Number:" + invoice.number);
      }
    });

## Changelog

**Update 18/8:** Version 0.1.2 has just been pushed. There is now an "options" 
object containing page, per_page, pages and total accessible from list methods.

**Update 14/7:** Just entered version 0.1.1! Most methods now accept an optional
id first argument (similar to how invoice.get() works). Examples have been 
updated *and* all tests are passing.

**Update 8/7:** We've just entered version 0.1.0! All required API features are 
now implemented excluding callback and system.

**Update 5/6:** I've implimented about 75% of the API. Most of the core features 
are working but i'm still working through some minor issues. Tests are working 
now though!

**Update 4/6:** This project is very much a *WORK IN PROGRESS*. So far I've 
implimented the majority of the Invoice API and am tidying up the code before 
launching into the other APIs. I've also decided
to take some liberties on some aspects of the API, ie replacing 
invoice.lines.add/delete/update methods with Array.pop/push, as frankly there 
are better ways to interact with the API in JS than is currently implimented.

## License

(The MIT License)

Copyright (c) 2012 Marc Loney &lt;marc@metacrash.com.au&gt;

Permission is hereby granted, free of charge, to any person obtaininga copy of 
this software and associated documentation files (the 'Software'), to deal in 
the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of 
the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all 
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS 
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR 
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER 
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.