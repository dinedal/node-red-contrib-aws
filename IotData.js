
/**
 * Copyright 2017 Daniel Thomas.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

module.exports = function(RED) {
	"use strict";

	function AmazonAPINode(n) {
		RED.nodes.createNode(this,n);
		this.awsConfig = RED.nodes.getNode(n.aws);
		this.region = n.region;
		this.endpoint = n.endpoint;
		this.operation = n.operation;
		this.name = n.name;
		this.region = this.awsConfig.region;
		this.endpoint = this.awsConfig.endpoint;
		this.accessKey = this.awsConfig.accessKey;
		this.secretKey = this.awsConfig.secretKey;

		var node = this;
		var AWS = require("aws-sdk");
		AWS.config.update({
			accessKeyId: this.accessKey,
			secretAccessKey: this.secretKey,
			region: this.region
		});
		if (!AWS) {
			node.warn("Missing AWS credentials");
			return;
		}

        if (this.awsConfig.proxyRequired){
            var proxy = require('proxy-agent');
            AWS.config.update({
                httpOptions: { agent: new proxy(this.awsConfig.proxy) }
            });
				}
				
		var constructor_args = { 'region': node.region, 's3ForcePathStyle': true };

		if (node.endpoint && node.endpoint !== '') {
			constructor_args['endpoint'] = new AWS.Endpoint(node.endpoint);
		}

		var awsService = new AWS.IotData( constructor_args );

		node.on("input", function(msg) {
			node.sendMsg = function (err, data) {
				if (err) {
				    node.status({fill:"red",shape:"ring",text:"error"});
                    node.error("failed: " + err.toString(), msg);
                    node.send([null, { err: err }]);
    				return;
				} else {
				msg.payload = data;
				node.status({});
				}
				node.send([msg,null]);
			};
		
			var _cb=function(err,data){
				node.sendMsg(err,data);
			}		

			if (typeof service[node.operation] == "function"){
				node.status({fill:"blue",shape:"dot",text:node.operation});
				service[node.operation](awsService,msg,_cb);
			} else {
				node.error("failed: Operation node defined - "+node.operation);
			}

		});
		var copyArg=function(src,arg,out,outArg,isObject){
			var tmpValue=src[arg];
			outArg = (typeof outArg !== 'undefined') ? outArg : arg;

			if (typeof src[arg] !== 'undefined'){
				if (isObject && typeof src[arg]=="string" && src[arg] != "") { 
					tmpValue=JSON.parse(src[arg]);
				}
				out[outArg]=tmpValue;
			}
                        //AWS API takes 'Payload' not 'payload' (see Lambda)
                        if (arg=="Payload" && typeof tmpValue == 'undefined'){
                                out[arg]=src["payload"];
                        }

		}

		var service={};

		
		service.DeleteThingShadow=function(svc,msg,cb){
			var params={};
			//copyArgs
			
			copyArg(n,"thingName",params,undefined,false); 
			
			copyArg(msg,"thingName",params,undefined,false); 
			copyArg(msg,"shadowName",params,undefined,false); 
			

			svc.deleteThingShadow(params,cb);
		}

		
		service.GetThingShadow=function(svc,msg,cb){
			var params={};
			//copyArgs
			
			copyArg(n,"thingName",params,undefined,false); 
			
			copyArg(msg,"thingName",params,undefined,false); 
			copyArg(msg,"shadowName",params,undefined,false); 
			

			svc.getThingShadow(params,cb);
		}

		
		service.ListNamedShadowsForThing=function(svc,msg,cb){
			var params={};
			//copyArgs
			
			copyArg(n,"thingName",params,undefined,false); 
			
			copyArg(msg,"thingName",params,undefined,false); 
			copyArg(msg,"nextToken",params,undefined,false); 
			copyArg(msg,"pageSize",params,undefined,false); 
			

			svc.listNamedShadowsForThing(params,cb);
		}

		
		service.Publish=function(svc,msg,cb){
			var params={};
			//copyArgs
			
			copyArg(n,"topic",params,undefined,false); 
			
			copyArg(msg,"topic",params,undefined,false); 
			copyArg(msg,"qos",params,undefined,false); 
			copyArg(msg,"payload",params,undefined,false); 
			

			svc.publish(params,cb);
		}

		
		service.UpdateThingShadow=function(svc,msg,cb){
			var params={};
			//copyArgs
			
			copyArg(n,"thingName",params,undefined,false); 
			copyArg(n,"payload",params,undefined,false); 
			
			copyArg(msg,"thingName",params,undefined,false); 
			copyArg(msg,"shadowName",params,undefined,false); 
			copyArg(msg,"payload",params,undefined,false); 
			

			svc.updateThingShadow(params,cb);
		}

			

	}
	RED.nodes.registerType("AWS IotData", AmazonAPINode);

};
