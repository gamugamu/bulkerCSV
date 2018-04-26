
Vue.use(VueMaterial.default)

var WEIGHT = 1
var bus = new Vue()

Vue.component('productlist', {
  template: `
    <div id="productlist">
    <div v-if="products.length">
      <div v-for="(product, index)  in products" class="relative hoverable one_line product_hilighed tooltipped" v-on:click="clicked(index)" v-on:mouseover="mouseOver">

        <div v-if="(index % 6) -1 == 0">
          <img class="product_result product_result_more" :src="product._source.image_link_https"  :alt="index">
        </div>
        <div v-else-if="_weight(1)">
          <img class="product_result" :src="product._source.image_link_https"  :alt="index">
        </div>

        <div v-if="product._source.condition == 'new'" class="sticker white-text">NEW</div>
        <md-tooltip md-direction="top">{{product._source.title}}</md-tooltip>
        <div class="uuid white-text">{{product._source.price}} €</div>
        <div class="price white-text">{{product._source.id}}</div>
        <product_interest :product_uid="product._id" ref="product_interest"></product_interest>
        <div v-if="product._source.rating" class="rating gray-text">☆{{product._source.rating}}</div>
        <div class="taille red-text"><b>{{product._source.taille}} - {{index}}</b></div>
      </div>
        </br>
          <md-progress-bar v-if="this.$parent.is_performing_request" class="loader_oneline" md-mode="indeterminate"></md-progress-bar>
        </br>
        <div v-if="need_more">
        NEED MORE
        </div>
      </div>
      <div v-else class="center-align">
        No result found
      </div>
    </div>
  `,computed: {
  },
  data: function () {
      return {
          products: [],
          need_more: false
      };
  },
  methods: {
    mouseOver: function(e){
       var idx = e.target.alt
       if(this.products[idx]){
         console.log("p", this.products[idx]);
      }
    },
    clicked:function(e){
      this.$refs["product_interest"][e].add_interest(1)
    },
    _weight:function(w){
      if(w == 1){
        WEIGHT++
        return true
      }else if (WEIGHT % 5 != 0){
        console.log("+");
        WEIGHT+= 2
        return true
      }else{
        return false
      }
    },
    re_init: function (event) {
      console.log("reinit___");
      WEIGHT = 1
    },
    re_display: function (event) {
      var div = document.getElementById('productlist');
      console.log("asked redisplay");
      window.scrollTo(0, div.offsetTop);
      setTimeout(function(){
        bus.$emit('re_display');
      }, 100)
    },
    handleScroll: function (event) {
           // your code here
      //console.log("scroll", event);
      // example use
      var div = document.getElementById('productlist');
      var is_out_bound  =  div.getBoundingClientRect().top + div.clientHeight - window.innerHeight <= 0

      if (is_out_bound){
        this.$parent.ask_next_page()
      }
    }
  },
  created: function () {
      window.addEventListener('scroll', this.handleScroll);
  },

  destroyed: function () {
      window.removeEventListener('scroll', this.handleScroll);
  }
})
var __interest = {}
Vue.component('product_interest', {
  props : ['product_uid'],
  template: `
    <div>
        <transition name="fade">
          <div class="add_interest" v-if="this.interest != 0">
            {{interest}}
          </div>
        </transition>
    </div>
  `,
  data: function () {
      return {
          interest: 0
      };
  },
  created: function(){
    var _this = this
    bus.$on('re_display', function () {
      console.log("** redisplayed", __interest);
      var v = __interest[_this.product_uid]
      console.log("---v", _this.product_uid, v);
      if (typeof v === 'undefined'){
        v = 0
      }
      _this.interest = v
    })
  },
  methods: {
    add_interest: function (incr) {
      var interest = __interest[this.product_uid]
      console.log("__interest[this.product_uid]", this.product_uid);

      if (typeof interest === 'undefined'){
        interest = 0
      }
      this.interest = ++interest % 6
      __interest[this.product_uid] = this.interest
      console.log(__interest[this.product_uid]);
   }
}
})

Vue.component('pagination', {
  template: `
    <div>

    <ul class="collapsible">
     <li>
      <div class="collapsible-header"><i class="material-icons">filter_9_plus</i>Pages</div>
      <div class="collapsible-body">
          <button v-for="(item, index) in this.$parent.total_pages"
            class="btn-flat waves-light" :key="item.id" v-on:click="show(item)">{{item}}</button>
        </div>
      </li>
    </ul>

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

var __tId = null // private!
var app = new Vue({
  el: '#app',
  delimiters: ['${', '}'],
  methods: {
    // fait la requete elasticpath pour retrouver les produits filtrés
    axio_call: function(arg, has_delta=false){
      var _this = this

      // refuse l'appel si vide.
      if( Object.keys(arg).length && this.is_performing_request == false){
        this.is_performing_request = true;

        setTimeout(function(){
          axios.post('match', {
            value: arg,
            from_pages: _this.current_page + 1
          })
          .then(function (response) {
            _this.$refs.productlist.re_init()
            if(has_delta && _this.delta_page < 4){
              // append
              _this.delta_page += 1;
              _this.$refs.productlist.products.push.apply(_this.$refs.productlist.products, response.data["data"])
              _this.total_pages = response.data["total_pages"] * _this.delta_page
            }else{
              // reinit
              _this.delta_page  = 0
              _this.$refs.productlist.re_display()

              _this.total_pages = response.data["total_pages"]
              _this.$refs.productlist.products = response.data["data"]
            }

            _this.current_page  = response.data["current_page"]
            _this.total_pages   = response.data["total_pages"]
            _this.hits          = response.data["hits"]

            _this.is_performing_request = false;
          })
          .catch(function (error) {
            console.log("________error:", error);
          });
        }, 200);
      }
    },
    elk_change(key, value, page=0){
      this.current_page             = page
      this.elastic_filter[key]      = value
      this.elastic_filter["RANGE"]  = this.elastic_range // bad scope
      this.axio_call(this.elastic_filter)
    },
    ask_next_page(call_back){
      // Il faut au moins une recherche valide/
      if(this.total_pages != 0){
        this.axio_call(this.elastic_filter, has_delta=true)
      }
    }
  },
  data:{
    elastic_filter:{},
    elastic_range:{},
    price_range: [0, 100],
    age_group: "",
    gender: "",
    hits: 0,
    selected_colors: [],
    selected_size: [],
    selected_material: [],
    current_page: 0,
    total_pages: 0,
    taped_page: 0,
    is_performing_request: false,
    delta_page: 0,
    active: true
  },
  created: function(){
    var _this = this
    bus.$on('price_change', function (value, handle) {
      if(_this.elastic_range){
        clearTimeout(__tId)

        _this.elastic_range['price_range']  = value
        _this.price_range                   = value // display

        __tId = setTimeout(function(){
          _this.elk_change("", 0)
        }, 1000);
      }
    })
   },
  watch: {
      'selected_colors': function(val, oldVal){
        this.elk_change("generic_color", val)
      },
      'selected_size': function(val, oldVal){
        this.elk_change("taille", val)
      },
      'age_group':function(val, oldVal){
        this.elk_change("ageGroup", val)
      },
      'gender': function(val, oldVal){
        this.elk_change("gender", val)
      },
      'taped_page': function(val, oldVal){
        this.elk_change("", 0, page = val - 1)
      }
  }
});

// Note: Tout ces fonctions sont due à l'incompleteté de vue material.
var slider = document.getElementById('test-slider');
 noUiSlider.create(slider, {
  start: [0, 100],
  connect: true,
  step: 1,
  orientation: 'horizontal', // 'horizontal' or 'vertical'
  range: {
    'min': 0,
    'max': 100
  }
 });

 slider.noUiSlider.on('update', function( values, handle ) {
   bus.$emit('price_change', values, handle);
 });

var elem = document.querySelector('.collapsible');
var instance = M.Collapsible.init(elem);

 // helpers
 function offset(el) {
    var rect    = el.getBoundingClientRect(),
    scrollLeft  = window.pageXOffset || document.documentElement.scrollLeft,
    scrollTop   = window.pageYOffset || document.documentElement.scrollTop;
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
}
