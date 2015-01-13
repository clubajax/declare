define([], function(){
	
	var
		uids = {}
		//,declareObject = {}
		;
	
	function uid(type){
        if(!uids[type]){
            uids[type] = [];
        }
        var id = type + '' + (uids[type].length + 1);
        uids[type].push(id);
        return id;
    }
	
	
	function mix(a, b){
		var key;
		for(key in b){
			// purposely not using hasOwnProperty()
			a[key] = b[key];
		}
		return a;
	}
	
	function flattenArrays(args){
		var i, k, flat = [];
		for(i = 0; i < args.length; i++){
			if(Array.isArray(args[i])){
				for(k = 0; k < args[i].length; k++){
					flat.push(args[i][k]);
				}
			}
			else if(args[i]){
				// dcl allows for null arguments
				flat.push(args[i]);
			}
		}
		return flat;
	}
	
	//function addSuper(instance){
	//	Object.create(instance, {
	//		chain:{
	//			value: function(proto, methodName){
	//				return Object.getPrototypeOf(proto)[methodName];
	//			}
	//		}			
	//	});
	//}
	
	function declare(){
		// declare
		//	each argument is a prototype-constructor
		//	first is base class, last is the final constructor
		var
			proto,
			iProto,
			protos = [],
			constrs = [],
			i,
			arg,
			args = flattenArrays(arguments),
			protoChain = [];
		
		function inherit(a, b, isLast){
			var proto;
			if(!b){
				a.getSuper = function(o){
					return null;
				};
				protoChain.push(a);
				proto = Object.create(a);
				return proto;
			}
			(function(){
				var _super = protoChain[protoChain.length - 1];
				b.getSuper = function(o){
					return _super;
				};
			}());
			
			protoChain.push(b);
			if(isLast){
				return mix(a, b);
			}
			return Object.create(mix(a, b));
		}
		
		// separate constructors and prototypes
		for(i = 0; i < args.length; i++){
			arg = args[i];
			if(typeof arg === 'function'){
				protos.push(arg.prototype);
				constrs.push(arg);
			}
			else{
				if(arg.constructor){
					constrs.push(arg.constructor);
					delete arg.constructor;
					protos.push(arg);
				}
			}
		}
		
		//if(protos.length > 1){
		//	addSuper(protos[protos.length-1]);
		//}
		
		
		// create prototype chain
		for(i = 0; i < protos.length; i++){
			iProto = protos[i];
			if(!proto){
				// first prototype
				proto = inherit(iProto);
			}
			//else if(i === protos.length - 1){
			//	// last prototype, just mix in the properties because
			//	// the result will be a prototype on the final constructor
			//	mix(proto, iProto);
			//}
			else{
				// middle prototypes
				proto = inherit(proto, iProto, i === protos.length - 1);
			}
		}
		
		function Constructor(){
			for(i = 0; i < constrs.length; i++){
				constrs[i].apply(this, arguments);
			}
		}
			
		if(!declare.evalVariable){
			Constructor.prototype = proto;
			return Constructor;
		}else{
			console.log('EVAL');
			return (function(){
				// This ceremony is a lot of bang for little buck.
				// The intent is that the resulting constructor will have a name
				// assigned that will show up in debuggers, like Chrome's Inspector.
				var
					str,
					id = uid('declare'),
					// The constructor name. Either the declaredClass from the last
					// prototype-constructor, or a unique name
					fname = iProto.declaredClass || id;
				
				// TODO Wrap this in a global map __declare[]
				
				// new Function is used below, which only can see itself and the global scope
				// Unique names are needed to prevent clashes with other declared classes
				window['constrs' + id] = constrs;
				window['proto' + id] = proto;
				
				// The stringified code that will be eval'd
				str = 'var i, constrs = window["constrs' + id + '"], proto = window["proto' + id + '"]; ' +
				
				// The actual constructor (which loops through and calls the constructor chain)
				'function '+fname+'(){'+
					'for(i = 0; i < constrs.length; i++){'+
					'	constrs[i].apply(this, arguments);'+
					'}	'+
				'};'+
				fname+'.prototype = proto;' +
				'return ' + fname + ';';
				
				return (new Function(str)());
			}());
		}
	}
	
	declare.evalVariable = false;
	
	return declare;
});