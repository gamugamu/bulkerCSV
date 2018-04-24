
Vue.use(VueMaterial.default)

Vue.component('productlist', {
  template: `
    <div>
      <div class="relative" v-for="(product, index)  in products" v-bind:class="{one_line : true, product_hilighed : true, tooltipped : true}" v-on:mouseover="mouseOver">
        <img  class="product_result " :src="product._source.image_link_https"  :alt="index">
        <div v-if="product._source.condition == 'new'" class="sticker white-text">NEW</div>
        <md-tooltip md-direction="top">{{product._source.title}}</md-tooltip>
        <div class="uuid white-text">{{product._source.price}} €</div>
        <div class="price white-text">{{product._source.id}}</div>
        <div v-if="product._source.rating" class="rating gray-text yellow">☆{{product._source.rating}}</div>
        <div  class="taille red-text"><b>{{product._source.taille}}</b></div>

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

Vue.component('pagination', {
  template: `
    <div>
      <button v-for="item in this.$parent.total_pages" class="btn waves-effect waves-light" :key="item.id" v-on:click="show(item)">{{item}}</button>
    </div>
  `,computed: {
  },
  data: function () {
      return {
          pages: 10
      };
  },
  methods: {
    show: function (idx) {
      console.log("show", idx) // someValue
      this.$parent.taped_page = idx
    //  this.elastic_filter["page"] = idx
   },
    submit: function (msg, e) {
      e.stopPropagation()
      console.log(msg) // someValue
    },
     mouseOver: function(e){
       var idx = e.target.alt
       if(this.products[idx]){
         console.log(this.products[idx]._source);
      }
     }
  },
  watch: {
      'pages': function(val, oldVal){
        console.log('page changed', val);
      },
    }
})

var app = new Vue({
  el: '#app',
  delimiters: ['${', '}'],
  methods: {
    // fait la requete elasticpath pour retrouver les produits filtrés
    axio_call: function(arg){
      var _this = this
      // refuse l'appel si vide.
      if( Object.keys(arg).length){
        axios.post('match', {
          value: arg,
          from_pages: this.taped_page
        })
        .then(function (response) {
          // ne change pas
          _this.$refs.productlist.products = response.data["data"]
          _this.current_page  = response.data["current_page"]
          _this.total_pages   = response.data["total_pages"]
          _this.hits          = response.data["hits"]
          console.log("current_page", _this.current_page, _this.total_pages );
        })
        .catch(function (error) {
          console.log("error:", error);
        });
      }
    },
    elk_change(key, value){
      this.elastic_filter[key] = value
      this.axio_call(this.elastic_filter)
    }
  },
  data:{
    elastic_filter:{},
    age_group: "",
    gender: "",
    hits: 0,
    selected_colors: [],
    selected_size: [],
    selected_material: [],
    current_page: 1,
    total_pages: 1,
    taped_page: 0
  },
  watch: {
      'selected_colors': function(val, oldVal){
        this.elk_change("generic_color", val[0])
      },
      'selected_size': function(val, oldVal){
        this.elk_change("taille", val[0])
      },
      'age_group':function(val, oldVal){
        this.elk_change("ageGroup", val)
      },
      'gender': function(val, oldVal){
        this.elk_change("gender", val)
      },
      'taped_page': function(val, oldVal){
        // taped_page / current_page est global
        this.elk_change("", 0)
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
