define([], function () {

    var
		sandbox,
		declare,
		mocks = null,
		path = 'declare/src/declare';


    suite({

        name: 'declare',
		
		before: function(){
			sandbox = sinon.sandbox.create();	
		},
		
		after: function(){
			
		},

        beforeEach: function (load) {
			load(path, mocks, function(module){
				declare = module;
			});	
		},

        afterEach: function (unload) {
			sinon.sandbox.restore();
			unload();
		},

        'constructor loading': function () {
            expect(declare).to.be.a('function');
        },
		
		'declare a constructor': function(){
			var Cnst = declare({
				constructor: function(){}	
			});
			//console.log('Cnst', Cnst);
			expect(Cnst).to.be.a('function');
		},
		
		'instanciate a constructor': function(){
			var Cnst = declare({
				constructor: function(){}	
			}),
			c = new Cnst();
			expect(c).to.be.an('object');
		},
		
		'constructor should call instance methods': function(){
			var
				Cnst = declare({
					result: false,
					constructor: function(){
						this.foo();	
					},
					foo: function(){
						this.result = true;
					}
				}),
				c = new Cnst();
				
			expect(c.result).to.equal(true);
		},
		
		'constructors should fire from both prototypes': function(){
			var
				o1 = {
					o1: false,
					constructor: function(){
						this.o1 = true;	
					}
				},
				o2 = {
					o2: false,
					constructor: function(){
						this.o2 = true;
					}
				},
				Cnst = declare(o1,o2),
				c = new Cnst();
				
			expect(c.o1).to.equal(true);
			expect(c.o2).to.equal(true);
		},
		
		'constructor should call other prototypes methods': function(){
			var
				o1 = {
					result: false,
					otherbarResult: false,
					constructor: function(){
						this.foo();	
					},
					foo: function(){
						this.result = true;
					},
					otherbar: function(){
						this.otherbar = true;
					}
				},
				o2 = {
					barResult: false,
					constructor: function(){
						this.bar();
						this.otherbar();
					},
					bar: function(){
						this.barResult = true;
					}
				},
				Cnst = declare(o1,o2),
				c = new Cnst();
			expect(c.result).to.equal(true);
		},
		
		'should handle multiple inheritance': function(){
			
			// Make this a MIX?
			
			//function clone(orig) {
			//	let origProto = Object.getPrototypeOf(orig);
			//	return Object.assign(Object.create(origProto), orig);
			//}
			
			var
				o1 = {
					declaredClass:'O1',
					o1: false,
					constructor: function(){
						this.o1 = true;	
					}
				},
				o2 = {
					declaredClass:'O2',
					o2: false,
					constructor: function(){
						this.o2 = true;
					}
				},
				o3 = {
					declaredClass:'O3',
					o3: false,
					constructor: function(){
						this.o3 = true;
					}
				},
				o4 = {
					declaredClass:'O4',
					o4: false,
					constructor: function(){
						this.o4 = true;
					}
				},
				Cnst = declare(o1,o2,o3,o4),
				c;
				
				c = new Cnst();
			//expect(c.result).to.equal(true);
		},
		
		'constructor should work after last test': function(){
			var
				Cnst = declare({
					declaredClass: 'Cool',
					cool: false,
					constructor: function(){
						this.cool = true;
					}
				}),
				c = new Cnst();
			//expect(c.result).to.equal(true);
		},
		
		'should handle null arguments': function(){
			var
				o1 = {
					result: false,
					otherbarResult: false,
					constructor: function(){
						this.foo();	
					},
					foo: function(){
						this.result = true;
					},
					otherbar: function(){
						this.otherbar = true;
					}
				},
				o2 = {
					barResult: false,
					constructor: function(){
						this.bar();
						this.otherbar();
					},
					bar: function(){
						this.barResult = true;
					}
				},
				Cnst = declare(null, o1,o2),
				c = new Cnst();
			expect(c.result).to.equal(true);
		},
		
		'should handle prototypal method chaining': function(){
			
			var
				r1 = false,
				r2 = false,
				r3 = false,
				o1 = {
					id:'O1',
					foo: function(){
						r1 = this.id;
					}
				},
				o2 = {
					id:'O2',
					foo: function(){
						r2 = this.id;
						this.getSuper().foo();
					}
				},
				o3 = {
					id:'O3',
					foo: function(){
						r3 = this.id;
						this.getSuper().foo();
					}
				},
				Cnst = declare(o1,o2,o3),
				c = new Cnst();
				c.foo();
				
				//console.log(' -> C', c);
				//console.log('c.getSuper', c.getSuper());
				//console.log('c.getSuper.getSuper', c.getSuper().getSuper());
				//console.log('r', r1, r2, r3);
				
				expect(r1).to.equal(o1.id);
				expect(r2).to.equal(o2.id);
				expect(r3).to.equal(o3.id);
		
		}
	});
});