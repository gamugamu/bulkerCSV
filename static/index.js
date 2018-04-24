
Vue.use(VueMaterial.default)

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
    // fait la requete elasticpath pour retrouver les produits filtrés
    axio_call: function(arg){
      var _this = this
      console.log("--> ", _this.$refs.productlist);
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
    elastic_filter:{},
    age_group: "",
    gender: "",
    selected_colors: [],
    selected_size: [],
    selected_material: [],
    movie: 'godfather',
     country: null,
     font: null
  },
  watch: {
      'selected_colors': function(val, oldVal){
        console.log("change", val);
        this.elastic_filter["color"] = val[0]
        this.axio_call(this.elastic_filter)
      },
      'selected_size': function(val, oldVal){
        console.log("change", val);
        this.elastic_filter["taille"] = val[0]
        this.axio_call(this.elastic_filter)
      },

      'age_group':function(val, oldVal){
        this.elastic_filter["ageGroup"] = val
        console.log("dw",  this.age_group);
        this.axio_call(this.elastic_filter)
      },
      'gender': function(val, oldVal){
        console.log("gender", val);
        this.elastic_filter["gender"] = val
        this.axio_call(this.elastic_filter)
      }
  }
});

var slider = document.getElementById('test-slider');
 noUiSlider.create(slider, {
  start: [20, 80],
  connect: true,
  step: 1,
  orientation: 'horizontal', // 'horizontal' or 'vertical'
  range: {
    'min': 0,
    'max': 100
  }
 });
