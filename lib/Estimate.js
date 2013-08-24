var libxml = require('libxmljs');

/**
 * Creates a new Estimate.
 * 
 * @param {FreshBooks} FreshBooks
 * @return {Estimate}
 * @api public
 */
 
var Estimate = module.exports = function() {
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
 
Estimate.prototype._setXML = function(method, fn) {
  var xml = new libxml.Document()
    , request = xml.node("request").attr("method", method)
    , options
    , self = this;
    
  //If second argument not a function then we have been passed the 'options' for estimate.list
  if("function" === typeof arguments[2]) {
    options = arguments[1];
    fn = arguments[2];
  }
  
  switch(method) {
    case "estimate.create":
    case "estimate.update":
      var estimate = request.node("estimate")
        , lines = estimate.node("lines");
        
      for(var key in this) {
        if("function" !== typeof this[key]) {
          
          switch(key) {
            //Catch resulting values that can't be created/updated.
            case "freshbooks":
            case "folder":
            case "links":
            case "paid":
            case "staff_id":
            case "updated":
            case "url":
            case "auth_url":
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
              estimate.node("contacts").node("contact").node("contact_id").text(this[key]);
            break;
            
            default:
              estimate.node(key).text(this[key]);  
            break;
          }
        }
      }
    break;
      
    case "estimate.get":  
    case "estimate.delete":    
      request.node("estimate_id").text(self.estimate_id);
    break;
    
    case "estimate.sendByEmail":
      request.node("estimate_id").text(self.estimate_id);
      
      if(null !== options) {
        for(var key in options) {
          if("function" !== typeof options[key]) {
            request.node(key).text(options[key]);  
          }
        }
      }
    break;
    
    case "estimate.list":
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
 * Sets Estimate properties from results of XML request.
 * 
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */
 
Estimate.prototype._getXML = function(xml, fn) {
  var self = this
    , nodes = xml.get("//xmlns:estimate", this.freshbooks.ns).childNodes();
  
  for(var x=0; x < nodes.length; x++) {
    if("text" !== nodes[x].name()) {
      switch(nodes[x].name()) {
        case "invoice_id":
        break;
        
        case "contacts":
          this.contact_id = xml.get("//xmlns:contact_id",this.freshbooks.ns).text();
        break;
        
        case "links":
          this.links.client_view = xml.get("//xmlns:client_view",this.freshbooks.ns).text()
        , this.links.view = xml.get("//xmlns:view",this.freshbooks.ns).text();
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
 * Creates an Estimate.
 * 
 * @param {Function} fn
 * @api public
 */
 
Estimate.prototype.create = function(fn) {
  var self = this;
  
  this._setXML("estimate.create", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      
      /* TODO Do we need null !== here */
      
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT CREATE ESTIMATE: " + err));
      } else {
        self.estimate_id = xml.get("//xmlns:estimate_id", self.freshbooks.ns).text();
        self.get(self.estimate_id, fn);
      }
    });
  });
};

/**
 * Updates an Estimate.
 * 
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */
 
Estimate.prototype.update = function(fn) {
  var self = this;
  
  if("function" === typeof arguments[1]) {
    this.estimate_id = arguments[0];
    fn = arguments[1];
  }
  
  this._setXML("estimate.update", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT UPDATE ESTIMATE: " + err));
      } else {
        self.get(self.estimate_id, fn);
      }
    });
  });
};

/**
 * Gets an Estimate.
 * 
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */
 
Estimate.prototype.get = function(fn) {
  var self = this;

  if("function" === typeof arguments[1]) {
    this.estimate_id = arguments[0];
    fn = arguments[1];
  }
  
  this._setXML("estimate.get", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT GET ESTIMATE: " + err));
      } else {
        self._getXML(xml, function() {
          fn(null, self);
        });
      }
    });
  });
};

/**
 * Deletes an Estimate.
 * 
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */
 
Estimate.prototype.delete = function(fn) {
  var self = this;
  
  if("function" === typeof arguments[1]) {
    this.estimate_id = arguments[0];
    fn = arguments[1];
  }
  
  this._setXML("estimate.delete", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT DELETE ESTIMATE: " + err));
      } else {
        fn();
      }
    });
  });
};

/**
 * List Estimates.
 * 
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */
 
Estimate.prototype.list = function(fn) {
  var self = this
    , options = [];
    
  if("function" === typeof arguments[1]) {
    options = arguments[0];
    fn = arguments[1];
  }
    
  this._setXML("estimate.list", options, function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response", self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT LIST ESTIMATES: " + err));
      } else {
        var estimates = xml.get("//xmlns:estimates", self.freshbooks.ns)
          , options = { page: estimates.attr("page").value()
                      , per_page: estimates.attr("per_page").value()
                      , pages: estimates.attr("pages").value()
                      , total: estimates.attr("total").value() }
          , estimates = [];
                      
        xml.find("//xmlns:estimate", self.freshbooks.ns).forEach(function(a) {
          var estimate = new self.freshbooks.Estimate();
          xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>');
          estimate._getXML(xml, function() {
            estimates.push(estimate);
          });
        });

        fn(null, estimates, options);
      }
    });
  });
};

/**
 * Send Estimate by email.
 * 
 * @param {Function} fn
 * @api public
 */
 
Estimate.prototype.sendByEmail = function(fn) {
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
  
  this._setXML("estimate.sendByEmail", options, function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT SEND ESTIMATE BY EMAIL: " + err));
      } else {
        fn(null, self);
      }
    });
  });
};
