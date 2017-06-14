(function (document) {
  
  var suggestedSearches = ['1234 Product', '3456 Product', '5678 Product', '7890 Product'];

  // functions
  function autocomplete(val) {
    var return_results = [];

    for (i = 0; i < suggestedSearches.length; i++) {
      if (val === suggestedSearches[i].slice(0, val.length)) {
        return_results.push(suggestedSearches[i]);
      }
    }

    return return_results;
  }

  function suggestedClick() {
    if (event.target.tagName === "LI") {
      var data = {
        "event": "searchSuggest",
        "searchSuggest": {"q": event.target.innerText, "aq": document.querySelector("input").value}
      }
      dataLayer.push(data);
      document.querySelector("input").value = event.target.innerText;
      document.querySelector("form").submit();
    }
  }

  function searchSubmit(elem) {
    var data = {
      "event": "searchSubmit",
      "searchSubmit": {"q": event.target.query.value}
    }
    console.log("ssub: " + data);
    dataLayer.push(data);
  }

  function atc() {
    var data = {
      "event": "addToCart",
      "cart": {"prod_id": "1234", "sku": "789", "prod_ver": "en-us"}
    }
    console.log("atc: " + data);
    dataLayer.push(data);
  }

  function qv() {
    var data = {
      "event": "productQuickViewOpen",
      "quickViewProduct": {"prod_id": "1234", "sku": "789", "prod_name": "1234 Product"}
    }
    console.log("qv: " + data);
    dataLayer.push(data);
  }

  function completeKey() {
    input_val = event.target.value; // updates the variable on each ocurrence

    if (input_val.length > 0) {
      var results_to_show = [];

      autocomplete_results = document.getElementById("autocomplete-results");
      autocomplete_results.innerHTML = '';
      results_to_show = autocomplete(input_val);
      
      for (i = 0; i < results_to_show.length; i++) {
        autocomplete_results.innerHTML += '<li>' + results_to_show[i] + '</li>';

      }
      autocomplete_results.style.display = 'block';
    } else {
      results_to_show = [];
      autocomplete_results.innerHTML = '';
    }
    
  }

  document.querySelector('input').addEventListener('keyup', completeKey, false);
  document.getElementById("autocomplete-results").addEventListener('click', suggestedClick, false);
  document.querySelector("form").addEventListener('submit', searchSubmit, false);
  document.getElementById("addtocart").addEventListener('click', atc, false);
  document.getElementById("quickview").addEventListener('click', qv, false);


}(document))
