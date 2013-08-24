var libxml = require('libxmljs');

/**
 * Creates a new Invoice.
 * 
 * @param {FreshBooks} FreshBooks
 * @return {Invoice}
 * @api public
 */
 
var Invoice = module.exports = function() {
  this.links = {}
, this.lines = [];
};

/**
 * Constructs XML requests for the API depending on method.
 * 
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */
 
Invoice.prototype._setXML = function(method, fn) {
  var xml = new libxml.Document()
    , request = xml.node("request").attr("method", method)
    , options
    , self = this;
    
  //If second argument not a function then we have been passed the 'options' for invoice.list
  if("function" === typeof arguments[2]) {
    options = arguments[1];
    fn = arguments[2];
  }
  
  switch(method) {
    case "invoice.create":
    case "invoice.update":
      var invoice = request.node("invoice")
        , lines = invoice.node("lines");
        
      for(var key in this) {
        if("function" !== typeof this[key]) {
          
          switch(key) {
            //Catch resulting values that can't be created/updated.
            case "amount_outstanding":
            case "freshbooks":
            case "folder":
            case "links":
            case "paid":
            case "recurring_id":
            case "staff_id":
            case "updated":
            case "url":
            case "auth_url":
            case "estimate_id":
            break;
              
            case "lines":
              if(this.lines.length > 0) {
                this.lines.forEach(function(a) {
                  var line = lines.node("line");
                
                  for(var key in a) {
                    line.node(key).text(a[key]);
                  }
                });
              }
            break;
              
            case "contact_id":
              invoice.node("contacts").node("contact").node("contact_id").text(this[key]);
            break;
            
            default:
              invoice.node(key).text(this[key]);  
            break;
          }
        }
      }
    break;
      
    case "invoice.get":
    case "invoice.sendBySnailMail":
    case "invoice.delete":    
      request.node("invoice_id").text(self.invoice_id);
    break;
    
    case "invoice.sendByEmail":  
      request.node("invoice_id").text(self.invoice_id);
      
      if(null !== options) {
        for(var key in options) {
          if("function" !== typeof options[key]) {
            request.node(key).text(options[key]);  
          }
        }
      }
    break;
    
    case "invoice.list":
      if(null !== options) {
        for(var key in options) {
          if("function" !== typeof options[key]) {
            request.node(key).text(options[key]);  
          }
        }
      } 
    break;
  }

  fn(xml);
};

/**
 * Sets Invoice properties from results of XML request.
 * 
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */
 
Invoice.prototype._getXML = function(xml, fn) {
  var self = this
    , nodes = xml.get("//xmlns:invoice", this.freshbooks.ns).childNodes();
  
  for(var x=0; x < nodes.length; x++) {
    if("text" !== nodes[x].name()) {
      switch(nodes[x].name()) {
        case "estimate_id":
        break;
        
        case "contacts":
          this.contact_id = xml.get("//xmlns:contact_id",this.freshbooks.ns).text();
        break;
        
        case "links":
          this.links.client_view = xml.get("//xmlns:client_view",this.freshbooks.ns).text()
        , this.links.view = xml.get("//xmlns:view",this.freshbooks.ns).text()
        , this.links.edit = xml.get("//xmlns:edit",this.freshbooks.ns).text();
        break;
        
        case "lines":
          xml.find("//xmlns:line",this.freshbooks.ns).forEach(function(a) {
            var line = {}
              , a = a.childNodes();

            for(var y=0; y < a.length; y++) {
              if("text" !== a[y].name()) {
                line[a[y].name()] = a[y].text();
              }
            }
            self.lines.push(line);
          });
        break;
        
        default:
          this[nodes[x].name()] = nodes[x].text();
        break;
      }
    }
  }
  fn();
};

/**
 * Creates an Invoice.
 * 
 * @param {Function} fn
 * @api public
 */
 
Invoice.prototype.create = function(fn) {
  var self = this;
  
  this._setXML("invoice.create", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT CREATE INVOICE: " + err));
      } else {
        self.invoice_id = xml.get("//xmlns:invoice_id", self.freshbooks.ns).text();
        self.get(self.invoice_id, fn);
      }
    });
  });
};

/**
 * Updates an Invoice.
 * 
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */
 
Invoice.prototype.update = function(fn) {
  var self = this;
  
  if("function" === typeof arguments[1]) {
    this.invoice_id = arguments[0];
    fn = arguments[1];
  }
  
  this._setXML("invoice.update", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT UPDATE INVOICE: " + err));
      } else {
        self.get(self.invoice_id, fn);
      }
    });
  });
};

/**
 * Gets an Invoice.
 * 
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */
 
Invoice.prototype.get = function(fn) {
  var self = this;

  if("function" === typeof arguments[1]) {
    this.invoice_id = arguments[0];
    fn = arguments[1];
  }
  
  this._setXML("invoice.get", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT GET INVOICE: " + err));
      } else {
        self._getXML(xml, function() {
          fn(null, self);
        });
      }
    });
  });
};

/**
 * Deletes an Invoice.
 * 
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */
 
Invoice.prototype.delete = function(fn) {
  var self = this;
  
  if("function" === typeof arguments[1]) {
    this.invoice_id = arguments[0];
    fn = arguments[1];
  }
  
  this._setXML("invoice.delete", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT DELETE INVOICE: " + err));
      } else {
        fn();
      }
    });
  });
};

/**
 * List Invoices.
 * 
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */
 
Invoice.prototype.list = function(fn) {
  var self = this
    , options = [];
    
  if("function" === typeof arguments[1]) {
    options = arguments[0];
    fn = arguments[1];
  }
    
  this._setXML("invoice.list", options, function(xml) {
    
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT LIST INVOICES: " + err));
      } else {
        var invoices = xml.get("//xmlns:invoices", self.freshbooks.ns)
          , options = { page: invoices.attr("page").value()
                      , per_page: invoices.attr("per_page").value()
                      , pages: invoices.attr("pages").value()
                      , total: invoices.attr("total").value() }
            invoices = [];
            
        xml.find("//xmlns:invoice", self.freshbooks.ns).forEach(function(a) {
          var invoice = new self.freshbooks.Invoice();
          xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>');
          invoice._getXML(xml, function() {
            invoices.push(invoice);
          });
        });
        
        fn(null, invoices, options);
      }
    });
  });
};

/**
 * Send Invoice by email.
 * 
 * @param {Number} options (optional)
 * @param {Function} fn
 * @api public
 */
 
Invoice.prototype.sendByEmail = function(fn) {
  var self = this
    , options = [];
  
  switch(typeof arguments[0]) {
    case "object":
      options = arguments[0];
      fn = arguments[1];
      
      this.invoice_id = options.invoice_id || this.invoice_id;
    break;
    
    case "number":
      this.invoice_id = arguments[0];
    break;
  }
  
  this._setXML("invoice.sendByEmail", options, function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT SEND INVOICE BY EMAIL: " + err));
      } else {
        fn(null, self);
      }
    });
  });
};

/**
 * Send Invoice by mail.
 * 
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */

Invoice.prototype.sendBySnailMail = function(id, fn) {
  var self = this;
  
  if("function" === typeof arguments[0]) {
    fn = arguments[0];
  } else {
    this.invoice_id = arguments[0];
  }
  
  this._setXML("invoice.sendBySnailMail", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT SEND INVOICE BY SNAIL MAIL: " + err));
      } else {
        fn(null, self);
      }
    });
  });
};
