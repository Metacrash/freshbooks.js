var libxml = require('libxmljs');

/**
 * Creates a new Recurring.
 * 
 * @param {FreshBooks} FreshBooks
 * @return {Recurring}
 * @api public
 */
 
var Recurring = module.exports = function() {
  this.lines = [];
};

/**
 * Constructs XML requests for the API depending on method.
 * 
 * @param {String} method
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api private
 */
 
Recurring.prototype._setXML = function(method, fn) {
  var xml = new libxml.Document()
    , request = xml.node("request").attr("method", method)
    , options
    , self = this;
    
  //If second argument not a function then we have been passed the 'options' for recurring.list
  if("function" === typeof arguments[2]) {
    options = arguments[1];
    fn = arguments[2];
  }
  
  switch(method) {
    case "recurring.create":
    case "recurring.update":
      var recurring = request.node("recurring")
        , lines = recurring.node("lines");
        
      for(var key in this) {
        if("function" !== typeof this[key]) {
          
          switch(key) {
            //Catch resulting values that can't be created/updated.
            case "freshbooks":
            case "folder":
            case "staff_id":
            case "updated":
            case "stopped":
            case "status":
            break;
            
            case "autobill":
              var autobill = recurring.node("autobill")
                , card = autobill.node("card")
                , expiration = card.node("expiration");
              
              autobill.node("gateway_name").text(this.autobill.gateway_name);
              card.node("number").text(this.autobill.card.number);
              card.node("name").text(this.autobill.card.name);
              expiration.node("month").text(this.autobill.card.expiration.month);
              expiration.node("year").text(this.autobill.card.expiration.year);
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
              recurring.node("contacts").node("contact").node("contact_id").text(this[key]);
            break;
            
            default:
              recurring.node(key).text(this[key]);  
            break;
          }
        }
      }
    break;
      
    case "recurring.get":
    case "recurring.sendBySnailMail":
    case "recurring.sendByEmail":  
    case "recurring.delete":    
      request.node("recurring_id").text(self.recurring_id);
    break;
    
    case "recurring.list":
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
 * Sets Recurring properties from results of XML request.
 * 
 * @param {Document} xml
 * @param {Function} fn
 * @api private
 */
 
Recurring.prototype._getXML = function(xml, fn) {
  var self = this
    , nodes = xml.get("//xmlns:recurring", this.freshbooks.ns).childNodes();
  
  for(var x=0; x < nodes.length; x++) {
    if("text" !== nodes[x].name()) {
      switch(nodes[x].name()) {
        case "estimate_id":
        break;
        
        case "contacts":
          this.contact_id = xml.get("//xmlns:contact_id",this.freshbooks.ns).text();
        break;
        
        case "autobill":
          if(xml.get("//xmlns:gateway_name",this.freshbooks.ns)) {
            this.autobill = {};
            this.autobill.card = {}
          , this.autobill.card.expiration = {}
          , this.autobill.gateway_name = xml.get("//xmlns:gateway_name",this.freshbooks.ns).text()
          , this.autobill.card.number = xml.get("//xmlns:number",this.freshbooks.ns).text()
          , this.autobill.card.name = xml.get("//xmlns:name",this.freshbooks.ns).text()
          , this.autobill.card.expiration.month = xml.get("//xmlns:month",this.freshbooks.ns).text()
          , this.autobill.card.expiration.year = xml.get("//xmlns:year",this.freshbooks.ns).text();
          }
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
 * Creates an Recurring.
 * 
 * @param {Function} fn
 * @api public
 */
 
Recurring.prototype.create = function(fn) {
  var self = this;
  
  this._setXML("recurring.create", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT CREATE RECURRING: " + err));
      } else {
        self.recurring_id = xml.get("//xmlns:recurring_id", self.freshbooks.ns).text();
        self.get(self.recurring_id, fn);
      }
    });
  });
};

/**
 * Updates an Recurring.
 *
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */
 
Recurring.prototype.update = function(fn) {
  var self = this;
  
  if("function" === typeof arguments[1]) {
    this.recurring_id = arguments[0];
    fn = arguments[1];
  }
  
  this._setXML("recurring.update", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT UPDATE RECURRING: " + err));
      } else {
        self.get(self.recurring_id, fn);
      }
    });
  });
};

/**
 * Gets an Recurring.
 * 
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */
 
Recurring.prototype.get = function(fn) {
  var self = this;

  if("function" === typeof arguments[1]) {
    this.recurring_id = arguments[0];
    fn = arguments[1];
  }
  
  this._setXML("recurring.get", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT GET RECURRING: " + err));
      } else {
        self._getXML(xml, function() {
          fn(null, self);
        });
      }
    });
  });
};

/**
 * Deletes an Recurring.
 * 
 * @param {Number} id (optional)
 * @param {Function} fn
 * @api public
 */
 
Recurring.prototype.delete = function(fn) {
  var self = this;
  
  if("function" === typeof arguments[1]) {
    this.recurring_id = arguments[0];
    fn = arguments[1];
  }
  
  this._setXML("recurring.delete", function(xml) {
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT DELETE RECURRING: " + err));
      } else {
        fn();
      }
    });
  });
};

/**
 * List Recurrings.
 * 
 * @param {Array} options (optional)
 * @param {Function} fn
 * @api public
 */
 
Recurring.prototype.list = function(fn) {
  var self = this
    , options = [];
    
  if("function" === typeof arguments[1]) {
    options = arguments[0];
    fn = arguments[1];
  }
    
  this._setXML("recurring.list", options, function(xml) {
    
    self.freshbooks._get(xml, function(err, xml) {
      if(null !== err) {
        fn(err);
      } else if("ok" !== xml.get("//xmlns:response",self.freshbooks.ns).attr("status").value()) {
        err = xml.get("//xmlns:error",self.freshbooks.ns).text();
        fn(new Error("CANNOT LIST RECURRINGS: " + err));
      } else {
        var recurrings = xml.get("//xmlns:recurrings", self.freshbooks.ns)
          , options = { page: recurrings.attr("page").value()
                      , per_page: recurrings.attr("per_page").value()
                      , pages: recurrings.attr("pages").value()
                      , total: recurrings.attr("total").value() }
            recurrings = [];
            
        xml.find("//xmlns:recurring", self.freshbooks.ns).forEach(function(a) {
          var recurring = new self.freshbooks.Recurring();
          xml = libxml.parseXmlString('<?xml version="1.0" encoding="UTF-8"?>' + '<response xmlns="http://www.freshbooks.com/api/" status="ok">' + a.toString() + '</response>');
          recurring._getXML(xml, function() {
            recurrings.push(recurring);
          });
        });
        
        fn(null, recurrings, options);
      }
    });
  });
};
