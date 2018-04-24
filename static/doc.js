
Vue.component('productlist', {
  template: `
    <div>
      <div v-for="(product, index)  in products" v-bind:class="{one_line : true, product_hilighed : true, tooltipped : true}" v-on:mouseover="mouseOver">
        <img  class="product_result " :src="product._source.image_link_https"  :alt="index">
      </div>
    </div>
  `,computed: {
  },
  data: function () {
      return {
          products: []
      };
  },
  methods: {
     mouseOver: function(e){
       var idx = e.target.alt
       if(this.products[idx]){
         console.log(this.products[idx]._source);
      }
     }
  },
})

var app = new Vue({
  el: '#app',
  delimiters: ['${', '}'],
  methods: {
    ageChange: function(e, value) {
      if(e.target.checked){
        this.elastic_filter["ageGroup"] = e.target.value
      }else{
        delete this.elastic_filter["ageGroup"]
      }
      this.axio_call(this.elastic_filter)
    },
    colorChange: function(e, value) {
      this.elastic_filter["color"] = e.target.value
      this.axio_call(this.elastic_filter)
    },
    // fait la requete elasticpath pour retrouver les produits filtrés
    axio_call: function(arg){
      var _this = this
      // refuse l'appel si vide.
      if( Object.keys(arg).length){
        axios.post('match', {
          value: arg
        })
        .then(function (response) {
          console.log("response", response, "data: ", response.data);
          // ne change pas
          _this.$refs.productlist.products = response.data
        })
        .catch(function (error) {
          console.log("error:", error);
        });
      }
    }
  },
  data:{
    elastic_filter:{}
  },
  watch: {
    }
});

var elem      = document.querySelector('select');
var instance  = M.FormSelect.init(elem);
