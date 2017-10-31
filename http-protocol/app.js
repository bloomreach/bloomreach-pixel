function renderExample(endpoint, pixelSpec, specIds, overRides) {
  const specs = specIds.map(id => pixelSpec[id]);
  const formattedParams = specs.map(spec => formatSpec(overRideExample(spec, overRides)));
  const queryString = "?" + formattedParams.join("&");
  return endpoint + queryString;
}

function overRideExample(spec, overRides) {

  if (spec.id in overRides) {
    let overRideSpec = Object.assign({}, spec);
    overRideSpec.example = overRides[spec.id];
    return overRideSpec;
  }
  
  return spec;
}

function formatSpec(spec) {
  return formatParam(spec.id, encode(formatValue(spec.encoding, spec.example)));
}

function formatValue(formatType, value) {
  let formattedVal = value;
  switch (formatType) {
    case 'cookie':
      formattedVal = `uid=${value.uuid}:v=app:ts=0:hc=${value.hitCount}`;
      break;
    case 'breadcrumb':
      formattedVal = value.join("|");
      break;
    case 'basket':
      formattedVal = encodeBasket(value);
      break;
  }
  return formattedVal;
}

function formatParam(key, value) {
    return key + "=" + value;
}

function encode(value, type) {
  return encodeURIComponent(value);
}



function getRequired(pixelSpec, types) {
  const allSpecs = Object.values(pixelSpec);
  return allSpecs.filter(spec => isOneOfTypes(spec, types));
}

function getRequiredIds(pixelSpec, types) {
    return getRequired(pixelSpec, types).map(spec => spec.id);
}

function isOneOfTypes(spec, types) {
  return spec.required.filter(type => types.includes(type)).length > 0;
}

function renderTable(specs) {

    return `
      <table class="tg">
        <tr>
          <th class="specName tg-yw4l">Name</th>
          <th class="specId tg-yw4l">Parameter</th>
          <th class="specExample tg-yw4l">Example Value</th>
          <th class="specDesc tg-yw4l">Description</th>
       </tr>
       ${specs.map(renderTableRow).join("\n")}
       </table>`;
  }

function renderTableRow(spec) {
  return `
    <tr>
    <td class="specName tg-yw4l"><strong>${spec.name}</strong></td>
    <td class="specId tg-b7b8"><code>${spec.id}</code></td>
    <td class="specExample tg-yw4l"><code>${encode(formatValue(spec.encoding, spec.example))}<code></td>
    <td class="specDesc tg-b7b8">${spec.description}</td>
  </tr>
  `;
}

function renderRequired(pixelSpec, type) {
  return renderTable(getRequired(pixelSpec, [type]));
}

function encodeBasket(items) {
  var ITEM_SEPARATOR = '!';
  var ATTR_SEPARATOR = '\'';
  var ATTR_CODE_MAP = {
    'prod_id' : 'i',
    'sku' : 's',
    'name' : 'n',
    'quantity' : 'q',
    'price' : 'p',
    'mod' : 'm',
    'prod_ver' : 'r'
  }
  var encoded_items = [];
  for (var idx = 0; idx < items.length; idx++) {
    var item_attrs = [];
    for (var key in items[idx]) {
      // Is this a valid key?
      if (key in ATTR_CODE_MAP) {
        var valueToPush = items[idx][key];
        if(typeof(valueToPush) == "string") {
          valueToPush = valueToPush.replace("!","%21");
            valueToPush = valueToPush.replace("\'","%27");
        }
        item_attrs.push([ATTR_CODE_MAP[key], valueToPush].join(''));
      }
    }
    var encoded_item = item_attrs.join(ATTR_SEPARATOR);
    encoded_items.push(encoded_item);
  }
  var result = ITEM_SEPARATOR + encoded_items.join(ITEM_SEPARATOR);
  return result;
}

const endpoint = "https://p.brsrvr.com/pix.gif";
const acctId = "<acct_id>";
const pixelSpec = {
"acct_id": {
    "id": "acct_id",
    "name": "Account ID",
    "description": "The account identifier (supplied by BloomReach).",
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["all"],
    "example": "5014"
},
"cookie2": {
    "id": "cookie2",
    "name": "Anonymous Identifier",
    "description": `<p>This field anonymously identifies a particular device instance.</p><p>The identifier should also include a <code>hitcount</code> value of 1 for a new visitor, or 2 for returning visitors.</p><p>Format is <code>uid={{UUID}}:v=app:ts=0:hc={{hitcount}}</code></p>`,
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "cookie",
    "required": ["all"],
    "example": {"uuid": "1e7724c751a3f6e6241018d150144832e7528383", "hitCount": "1"}
},
"rand": {
    "id": "rand",
    "name": "Cache Buster",
    "description": "A random number that is added to request to make sure browsers and proxies don't cache requests.",
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["all"],
    "example": Math.random() * 100000000000000000
},
"type": {
    "id": "type",
    "name": "Tracking Type",
    "description": `The type of tracking fire. Must be one of <code>pageview</code> or <code>event</code>.`,
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["all"],
    "example": "pageview"
},
"title": {
    "id": "title",
    "name": "Screen Name",
    "description": "Screen name of application view",
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["pageview"],
    "example": "Blue Lace Dress"
},
"url": {
    "id": "url",
    "name": "URL",
    "description": `<p>Synthetic unique URL composed of a static base URL and a screen application screen name.</p><p>Base URL: <code>http://merchantname.app/</code></p><p>To help maintain uniqueness, prefix the screen name with the page type classification.</p><p><code>http://merchantname.app/{{pageType}}/{{screenName}}</code></p>`,
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["pageview"],
    "example": "http://merchantname.app/product/blue%20lace%20dress"
},
"ref": {
    "id": "ref",
    "name": "Referrer URL",
    "description": `<p>Synthetic URL from referrer screen</p><p>Follows same format as <code>url</code> param above</p>`,
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["pageview"],
    "example": "http://merchantname.app/category/dresses"
},
"group": {
    "id": "group",
    "name": "Group Type",
    "description": "Specifies the event grouping. Must not be empty.",
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["event"],
    "example": "suggest"
},
"etype": {
    "id": "etype",
    "name": "Event Action Type",
    "description": "Specifies the event's action type. Must not be empty. Values for specific events in sections on specific events",
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["event"],
    "example": "click-add"
},
"ptype": {
    "id": "ptype",
    "name": "Page Type",
    "description": `<p>The type of the page, one of:</p><code>homepage</code> - application home screen</br><a class="ptype" href="#product">product</a> - product, product bundle, product collection, or sku set screens</br><a class="ptype" href="#category">category</a> - category listing pages and category product listing pages</br><a class="ptype" href="#search">search</a> - search listing pages</br><code>mlt</code> - More Like This screens</br><code>personalized</code> - Just For You screens</br><code>other</code> - default value if not one of other types`,
    "type": "text",
    "defaultValue": "other",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["pageview"],
    "example": "homepage"
},
"is_conversion": {
    "id": "is_conversion",
    "name": "Is Conversion",
    "description": `<p>Used to mark the screen displaying the conversion page.</p><p>Value should be set to 1 if conversion page.</p>`,
    "type": "text",
    "defaultValue": "0",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["conversion"],
    "example": "1"
},
"basket_value": {
    "id": "basket_value",
    "name": "Basket Value",
    "description": `<p>The total price of the checkout basket</p><p>Formatted in the account currency, without any symbols (e.g. '237.00').</p><p>This should be the basket value including tax / shipping / discounts.</p><p>E.g. if the checkout basket was $100 with $5 tax and $10 shipping, the value for this parameter should be '115.00'.</p>`,
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["conversion"],
    "example": "30.00"
},
"order_id": {
    "id": "order_id",
    "name": "Order ID",
    "description": `<p>For conversion pages, the order id associated with the order placed.</p><p>This id should match the orderID used in the your analytics systems. This is used to reconcile BloomReach's analytics data with your analytics systems.</p>`,
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["conversion"],
    "example": "88332121"
},
"basket": {
    "id": "basket",
    "name": "Basket",
    "description": `<p>The list of items in a basket on the conversion page.</p><p>Format of list of items is as follows:</p><p>Each item in the cart will be separated by <code>!</code></p><p>Each product's details will be separated by <code>.</code></p><p>Each item's Product ID should be formatted as <code>i{{prod_id}}</code></p><p>Each items's SKU should be formatted as <code>s{{sku}}</code></p><p>Each item's Product Name should be formatted as <code>n{{product_name}}</code></p><p>Each Item's Quantity should be formatted as <code>q{{quantity}}</code></p><p>Each Item's Price should be formatted as <code>p{{price}}</code></p><p>The item price should be the unit price per product and not total price. If the item is on sale, this is the unit sale price.</p>`,
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "basket",
    "required": ["conversion"],
    "example": [
      {"prod_id": "1234", "sku": "563", "name": "Blue Lace Dress", "quantity": "2", "price": "10.00"},
      {"prod_id": "7892", "sku": "121", "name": "Red Lace Dress", "quantity": "1", "price": "10.00"}]
},
"prod_id": {
    "id": "prod_id",
    "name": "Product ID",
    "description": "For product pages, this should match the unique product id sent in the feed. If a product is available in multiple SKUs (e.g. color/size combinations), this field refers to the id shared by all the SKUs for a product.\nThis field value is case-sensitive.",
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["product", "addToCartEvent"],
    "example": "prod1234"
},
"prod_name": {
    "id": "prod_name",
    "name": "Product Name",
    "description": "The name of the product",
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["product", "addToCartEvent"],
    "example": "Blue Lace Dress"
},
"sku": {
    "id": "sku",
    "name": "Product SKU",
    "description": "Unique SKU id that representing the selected variant of this product (e.g. size M, color blue of a t-shirt). If you don't have SKUs, leave this blank.",
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["product", "addToCartEvent"],
    "example": "123-45"
},
"cat": {
    "id": "cat",
    "name": "Breadcrumbs",
    "description": "The breadcrumb of the page. This should match the 'crumbs' field in the product feed that you send to BloomReach.\nThis is required for all category pages, and is used for analytics.",
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "breadcrumb",
    "required": ["category"],
    "example": ["home", "dresses"]
},
"cat_id": {
    "id": "cat_id",
    "name": "Breadcrumb Leaf",
    "description": "Unique category ID as referred to in the database/catalog. This should match the 'crumbs_id' field in the product feed that you send to BloomReach. This ID typically refers to the 'leaf' of the crumb.\nIdeally, this should be a unique category identifier that is consistently used across devices. This is required for all category pages, and is used for analytics.\nThis field value is case-sensitive.",
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["category"],
    "example": "dresses"
},
"search_term": {
    "id": "search_term",
    "name": "Search Term",
    "description": "Value of search that resulted in rendering of this search page",
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["search"],
    "example": "blue lace dress"
},
"q": {
    "id": "q",
    "name": "Search Query",
    "description": `<p>Search query sent to backend.</p><p>For suggested queries, this would be the suggested query that is sent to your search engine.</p>`,
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["searchEvent", "suggestEvent"],
    "example": "blue lace dress"
},
"aq": {
    "id": "aq",
    "name": "Typed Search",
    "description": `<p>Search display query</p><p>The one or more letters that the user has actually typed.</p><p>This is not the suggested word or phrase.</p>`,
    "type": "text",
    "defaultValue": "None",
    "maxLength": "None",
    "encoding": "urlencoded",
    "required": ["suggestEvent"],
    "example": "blu"
}
};

      const templates = {
        "endpoint": endpoint,
        "genericExample": renderExample(endpoint, pixelSpec, ['acct_id','type'], {}),
//          "exampleHomepage": renderExample(endpoint, pixelSpec, ['acct_id']),
        "requiredAll": renderRequired(pixelSpec, "all"),
        "requiredPageview": renderRequired(pixelSpec, "pageview"),
        "requiredProduct": renderRequired(pixelSpec, "product"),
        "requiredCategory": renderRequired(pixelSpec, "category"),
        "requiredSearch": renderRequired(pixelSpec, "search"),
        "requiredConversion": renderRequired(pixelSpec, "conversion"),
        "requiredEvent": renderRequired(pixelSpec, "event"),
        "requiredCart": renderRequired(pixelSpec, "addToCartEvent"),
        "requiredSearchEvent": renderRequired(pixelSpec, "searchEvent"),
        "requiredSuggestEvent": renderRequired(pixelSpec, "suggestEvent")
      };

    const exampleData = {
        //"homepage": {
        //    "specs": getRequiredIds(pixelSpec, ["all", "pageview"]),
        //    "overRides": {
        //        "url": "http://merchantname.app/homepage",
        //        "title": "Home"
        //    }
        //},
        "product": {
            "specs": getRequiredIds(pixelSpec, ["all", "pageview", "product"]),
            "overRides": {
                "ptype": "product"
            }
        },
        "category": {
            "specs": getRequiredIds(pixelSpec, ["all", "pageview", "category"]),
            "overRides": {
                "ptype": "category",
                "url": "http://merchantname.app/category/dresses",
                "ref": "http://merchantname.app/homepage",
                "title": "Dresses"
            }
        },
        "search": {
            "specs": getRequiredIds(pixelSpec, ["all", "pageview", "search"]),
            "overRides": {
                "ptype": "search",
                "url": "http://merchantname.app/search/blue%20lace%dress"
            }
        },
        "conversion": {
            "specs": getRequiredIds(pixelSpec, ["all", "pageview", "conversion"]),
            "overRides": {
                "ptype": "conversion",
                "url": "http://merchantname.app/conversion",
                "title": "Conversion"
            }
        },
        "cartCategory": {
            "specs": getRequiredIds(pixelSpec, ["all", "pageview", "event", "category", "product"]),
            "overRides": {
                "type": "event",
                "group": "cart",
                "ptype": "category",
                "url": "http://merchantname.app/category/dresses",
                "ref": "http://merchantname.app/homepage",
                "title": "Dresses"
            }
        },
        "cartProduct": {
            "specs": getRequiredIds(pixelSpec, ["all", "pageview", "event", "product"]),
            "overRides": {
                "type": "event",
                "group": "cart",
                "ptype": "product",
            }
        },
        "searchEventProduct": {
            "specs": getRequiredIds(pixelSpec, ["all", "pageview", "event", "searchEvent", "product"]),
            "overRides": {
                "type": "event",
                "group": "suggest",
                "etype": "submit",
                "ptype": "product"
            }
        },
        "suggestEventHomepage": {
            "specs": getRequiredIds(pixelSpec, ["all", "pageview", "event", "suggestEvent"]),
            "overRides": {
                "type": "event",
                "group": "suggest",
                "etype": "click",
                "ptype": "homepage",
                "title": "Home",
                "url": "http://merchantname.app/homepage"
            }
        }
      };
