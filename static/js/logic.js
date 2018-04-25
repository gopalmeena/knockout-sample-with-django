var mainURL = window.location.protocol+"//"+window.location.host+"/feature/";
var clientURL = mainURL+"client/",productURL = mainURL+"products/",featureURL = mainURL+"feature/"

ko.validation.init({
	registerExtenders: true,
	messagesOnModified: true,
	insertMessages: true,
	parseInputAttributes: true,
	messageTemplate: null,
	errorElementClass:'error'
});

var Client = function(id,name){
	var self = this;
	self.name = ko.observable(name),self.id = ko.observable(id);
}

var Feature = function(id,title,description,client,client_priority,target_date,product_area){
	console.log(title+description+client+client_priority+target_date+product_area)
	var self = this;
	this.title = ko.observable(title),this.description = ko.observable(description),this.client = ko.observable(client);
	this.clientPriority = ko.observable(client_priority),this.targetDate = ko.observable(target_date),this.productArea = ko.observable(product_area),this.id = ko.observable(id);
	console.log('Done');
}

var Product = function(id,name){
	var self = this;
	self.name = ko.observable(name),self.id = ko.observable(id);
}


var clientViewModel = function(){
	var self = this;

	self.showFeature = ko.observable(true);
	self.showClient = ko.observable(false);
	self.showProduct = ko.observable(false);
	self.refreshButton = ko.observable(true);
	self.saveButton = ko.observable(true);
	self.updateButton = ko.observable(false);
	self.deleteButton = ko.observable(false);
	self.clientList = ko.observableArray();
	self.SaveSuccess = ko.observable(false);
	self.SaveSuccessMsg = ko.observable('');
	self.selectedClient = ko.observable('');
	self.productAreaName = ko.observable().extend({required:true,minLength:1,maxLength:100});
	self.clientName = ko.observable().extend({ required: {message:"Name is required"}, minLength: 1});
	self.clientName.extend({
		validation:{
			validator:function(val){
				var clientArray = ko.utils.arrayFirst(self.clientList(), function(client) {
					return client.name().toLowerCase()===val.toLowerCase();
				});
				if(clientArray!==null){
					return false;
				}else{
					return true;
				}
			},
			message:"Sorry!! Name already exist",
		}
	});

	self.clientPriority = ko.observable().extend({ required: {message:"Priority is required"}, min: 1});

	self.featureTitle = ko.observable().extend({required:{message:"Title is required"},minLength:1,maxLength:50});
	self.featureDescription = ko.observable().extend({required:{message:"Description is required"},minLength:1,maxLength:800});
	self.featureClient = ko.observable().extend({required:{message:"Client is required"}});
	self.productAreaList = ko.observableArray();self.featureList = ko.observableArray();
	self.featureId = ko.observable();
	self.featureTargetDate = ko.observable().extend({required:{message:"Target Date is required"}});
	self.featureTargetDate.extend({
		validation:{
			validator:function(val){
				var givenDate = new Date(val),currentDate = new Date();
				var dateDifference = givenDate-currentDate;
				if (dateDifference>=0){
					return true;
				}else{
					if (givenDate.getDate()===currentDate.getDate()&givenDate.getMonth()===currentDate.getMonth()&givenDate.getFullYear()===currentDate.getFullYear()){
						return true;
					}else{
						return false;
					}
				}
			},
			message:"Date can't be less than today!"
		}
	})
	self.featureProductArea = ko.observable().extend({required:{message:"Product Area is required"}});
	self.featureSaveSuccess = ko.observable(false);
	self.featureSaveSuccessMsg = ko.observable('');

	self.pageSizeList = ko.observableArray([5,10,25,50,100]);self.pageNumber = ko.observable(1);
	self.prevToggle = ko.observable(false),self.nextToggle = ko.observable(false);self.pageSize = ko.observable(5);



	/* To add dynamic content of functionality in nav-bar */
	self.featureToggle = function(){
		self.showFeature(true);self.showClient(false);self.showProduct(false);
	};
	self.clientToggle = function(){
		self.showFeature(false);self.showClient(true);self.showProduct(false);
	};
	self.productToggle = function(){
		self.showFeature(false);self.showClient(false);self.showProduct(true);
	}

	/* To add dynamic button of functionality in modal */
	self.addChangeToggle = function(){
		self.refreshButton(true);self.saveButton(true),self.updateButton(false);self.deleteButton(false);
	}
	self.updateChangeToggle = function(){
		self.refreshButton(false);self.saveButton(false),self.updateButton(true);self.deleteButton(false);
	}
	self.deleteChangeToggle = function(){
		self.refreshButton(false);self.saveButton(false),self.updateButton(false);self.deleteButton(true);
	}

	/*Initially load all client,product are and feature */
	self.updateClientList = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.clientList.removeAll();
		/* Store client information in starting. It will help in searching client name while adding client */
		$.ajax({
			url:clientURL,
			type:'get',
			async:false,
			success: function(data){
				for(var i=0;i<data.length;i++){
					self.clientList.push(new Client(data[i]['id'],data[i]['name']));
				}
			}
		});
	};
	self.updateProductList = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.productAreaList.removeAll();
		/* Store Product area information in starting*/
		$.ajax({
			url:productURL,
			async:false,
			type:'get',
			success:function(data){
				for(var i=0;i<data.length;i++){
					self.productAreaList.push(new Product(data[i]['id'],data[i]['name']));
				}
			}
		});
	};
	self.updateFeatureList = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.featureList.removeAll();
		/* Store Product area information in starting*/
		$.ajax({
			url:featureURL,
			type:'get',
			success: function(data){
				for(var i=0;i<data.length;i++){
					var clientObj = self.clientList().findIndex(x => parseInt(x.id())== parseInt(data[i]['client']));
					var productObj = self.productAreaList().findIndex(x => parseInt(x.id())== parseInt(data[i]['product_area']));
					var targetdate = data[i]['target_date'].split('-');
					targetdate = targetdate[1]+'/'+targetdate[2]+'/'+targetdate[0];
					self.featureList.push(new Feature(data[i]['id'],data[i]['title'],data[i]['description'],self.clientList()[clientObj],data[i]['client_priority'],targetdate,self.productAreaList()[productObj]));
					console.log(i);
				}
				self.searchList(self.featureList().slice());
			}
		});

	};

	/**************     functionalities of client     ******************/


	self.clientName.subscribe(function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	});
	self.featureClient.subscribe(function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	});

	self.addClientToggle = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.addChangeToggle();self.clientName(undefined);
	}
	self.updateClientToggle = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.updateChangeToggle();self.clientName(undefined);self.featureClient(undefined);
	}
	self.deleteClientToggle = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.deleteChangeToggle();self.featureClient(undefined)
	}
	self.saveClient = function(){
		data = {"name":self.clientName()};
		$.post(clientURL,data,function(response,status){
			self.SaveSuccess(true);self.SaveSuccessMsg('Data Saved successfully.');
			setTimeout(function(){
				$('#clientModal').modal('hide');self.updateClientList();
			},300);
		}).fail(function(response,status){
			self.SaveSuccess(true);self.SaveSuccessMsg('Something Wrong happened. Try again!');
		});
	}

	/* Refresh data in client modal */
	self.refreshClient = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.SaveSuccess(false);self.SaveSuccessMsg('');self.clientName(undefined);
	};

	self.deleteClient = function(val){
		if(self.featureClient()){
			var URL = clientURL+self.featureClient().id();
			console.log(URL);
			$.ajax({
				url:URL,type:'DELETE',
				success:function(result){
					self.SaveSuccess(true);self.SaveSuccessMsg('CLient deleted successfully.');
					setTimeout(function(){
						$('#clientModal').modal('hide');self.updateClientList();
					},300);
				},
				error: function(response){
					var error_string = "";
					for (var i=0;i<response.length;i++){
						Object.keys(response[i]).forEach(function(key) {
							error_string += response[i][key];
						})
					}
					self.SaveSuccess(true);
					if(error_string.length>0){
						self.SaveSuccessMsg(error_string);
					}else{
						self.SaveSuccessMsg('Oops! Something wrong happened.Try again later.')
					}
				}
			});
		}
	};

	self.updateClient = function(){
		if(self.featureClient()&&self.clientName()){
			var data = {"name":self.clientName()};var URL = clientURL+self.featureClient().id()+'/';
			data = JSON.stringify(data);
			var headers = {'Content-type':'application/json'};
			$.ajax({
				url:URL,type:'PUT',
				data:data,headers:headers,
				success:function(result){
					self.SaveSuccess(true);self.SaveSuccessMsg('Client updated successfully.');
					setTimeout(function(){
						$('#clientModal').modal('hide');self.updateClientList();
					},300);
				},
				error: function(response){
					var error_string = "";
					for (var i=0;i<response.length;i++){
						Object.keys(response[i]).forEach(function(key) {
							error_string += response[i][key];
						})
					}
					self.SaveSuccess(true);
					if(error_string.length>0){
						self.SaveSuccessMsg(error_string);
					}else{
						self.SaveSuccessMsg('Oops! Something wrong happened.Try again later.')
					}
				}
			});
		}else{
			if(self.clientName()){
				self.SaveSuccessMsg('Select Client');self.SaveSuccess(true);
			}else{
				self.SaveSuccessMsg("New name can't be blank");self.SaveSuccess(true);
			}
		}
	};


	/************************ Functionality of Feature **************************/


	self.addFeatureToggle = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.addChangeToggle();self.featureTitle(null);self.featureDescription(null);self.featureClient(null);
		self.featureProductArea(null);self.featureTargetDate(null);self.clientPriority(null);
	}
	self.updateFeatureToggle = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.updateChangeToggle();self.featureTitle(null);self.featureDescription(null);self.featureClient(null);
		self.featureProductArea(null);self.featureTargetDate(null);self.clientPriority(null);
	}
	self.deleteFeatureToggle = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.deleteChangeToggle();
	}

	self.saveFeature = function(){
		var target_date = self.featureTargetDate();
		target_date = target_date.split('/');target_date = target_date[2]+'-'+target_date[0]+'-'+target_date[1];
		var data = {"title":self.featureTitle(),"description":self.featureDescription(),"client":self.featureClient().id(),"target_date":target_date,"product_area":self.featureProductArea().id(),"client_priority":self.clientPriority()};
		console.log(data);
		data = JSON.stringify(data);
		var headers = {'Content-type':'application/json'};
		console.log(data);
		$.ajax({
			url:featureURL,type:'post',headers:headers,data:data,
			success: function(){
				self.SaveSuccess(true);self.SaveSuccessMsg('Feature Saved successfully.')
				setTimeout(function(){
					$('#featureModal').modal('hide');self.updateFeatureList();
				},300);
			},
			error: function(response){
				var error_string = "";
				for (var i=0;i<response.length;i++){
					Object.keys(response[i]).forEach(function(key) {
						error_string += response[i][key];
					})
				}
				self.SaveSuccess(true);
				if(error_string.length>0){
					self.SaveSuccessMsg(error_string);
				}else{
					self.SaveSuccessMsg('Oops! Something wrong happened.Try again later.')
				}
			}
		});
		/*$.post("http://localhost:8000/feature/feature/",headers,data,function(response,status){
			self.featureSaveSuccess(true);self.featureSaveSuccessMsg('Data Saved successfully.')
		}).fail(function(response,status){
			self.featureSaveSuccess(true);self.featureSaveSuccessMsg('Something Wrong happened. Try again!');
		});*/
	};

	self.refreshFeature = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.featureSaveSuccess(false);
		self.featureSaveSuccessMsg('')
		self.featureTitle(undefined),self.featureDescription(undefined),self.featureClient(undefined),self.featureTargetDate(undefined),self.featureProductArea(undefined);
	}

	self.updateFeature = function(val){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		$('#featureModal').modal('show');
		self.featureId(val.id());
		self.updateFeatureToggle();
		self.featureTitle(val.title());self.featureClient(val.client());self.featureTargetDate(val.targetDate());
		self.featureProductArea(val.productArea());self.featureDescription(val.description());self.clientPriority(val.clientPriority());
	};

	self.updateFeatureItem = function(){
		var target_date = self.featureTargetDate();
		target_date = target_date.split('/');target_date = target_date[2]+'-'+target_date[0]+'-'+target_date[1];
		var data = {"title":self.featureTitle(),"description":self.featureDescription(),"client":self.featureClient().id(),"target_date":target_date,"product_area":self.featureProductArea().id(),"client_priority":self.clientPriority()};
		console.log(data);
		data = JSON.stringify(data);
		var headers = {'Content-type':'application/json'};
		console.log(data);
		var url = featureURL+self.featureId()+"/";
		$.ajax({
			url:url,type:'put',headers:headers,data:data,
			success: function(response){
				self.SaveSuccess(true);self.SaveSuccessMsg('Feature updated successfully.');
				setTimeout(function(){
					$('#featureModal').modal('hide');self.updateFeatureList();
				},300);
			},
			error: function(jqXHR, textStatus, errorThrown){
				console.log(jqXHR['responseJSON']);
				console.log(textStatus);
				console.log(errorThrown);
				var error_string = "";
				error_string = jqXHR['responseJSON']['error'];
				self.SaveSuccess(true);
				if(error_string.length>0){
					self.SaveSuccessMsg(error_string);
				}else{
					self.SaveSuccessMsg('Oops! Something wrong happened.Try again later.')
				}
			}
		});
	};


	self.deleteFeature = function(val){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.featureId(val.id());
		$('#featureModal').modal('show');
		self.deleteFeatureToggle();
		self.featureTitle(val.title());self.featureClient(val.client());self.featureTargetDate(val.targetDate());
		self.featureProductArea(val.productArea());self.featureDescription(val.description());self.clientPriority(val.clientPriority());
	};

	self.deleteFeatureItem = function(val){
		alert('in')
		var url = featureURL+self.featureId()+"/";
		$.ajax({
			url:URL,type:'DELETE',
			success:function(result){
				self.SaveSuccess(true);self.SaveSuccessMsg('Feature deleted successfully.');
				setTimeout(function(){
					$('#featureModal').modal('hide');self.updateFeatureList();
				},300);
			},
			error: function(jqXHR, textStatus, errorThrown){
				self.SaveSuccess(true);
				var error_string = "";
				error_string = jqXHR['responseJSON']['error'];
				if(error_string.length>0){
					self.SaveSuccessMsg(error_string);
				}else{
					self.SaveSuccessMsg('Oops! Something wrong happened.Try again later.')
				}
			}
		});
	};





	/************************ Functionality of Product Area **************************/

	self.productAreaName.subscribe(function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	})
	self.featureProductArea.subscribe(function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	})

	self.addProductToggle = function(){
		self.addChangeToggle();self.featureProductArea(undefined);self.productAreaName(undefined);
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	}
	self.updateProductToggle = function(){
		self.updateChangeToggle();self.featureProductArea(undefined);self.productAreaName(undefined);
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	}
	self.deleteProductToggle = function(){
		self.deleteChangeToggle();self.featureProductArea(undefined);self.productAreaName(undefined);
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	}
	self.saveProductArea = function(){
		var data = {"name":self.productAreaName()};
		$.post(productURL,data,function(response,status){
			self.SaveSuccess(true);self.SaveSuccessMsg('Product area Saved successfully.');
			setTimeout(function(){
				$('#productModal').modal('hide');self.updateProductList();
			},300);
		}).fail(function(response,status){
			console.log(response+' '+status)
			self.SaveSuccess(true);
			self.SaveSuccessMsg('Something Wrong happened. Try again!');
		});

	};

	self.refreshProductArea = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');self.productAreaName(undefined);
	};

	self.deleteProductArea = function(val){
		if(self.featureClient()){
			var URL = productURL+self.featureProductArea().id();
			console.log(URL);
			$.ajax({
				url:URL,type:'DELETE',
				success:function(result){
					self.SaveSuccess(true);self.SaveSuccessMsg('Delete successfull');
					setTimeout(function(){
						$('#productModal').modal('hide');self.updateClientList();
					},300);
				},
				error: function(jqXHR, textStatus, errorThrown){
					self.SaveSuccess(true);
					var error_string = "";
					error_string = jqXHR['responseJSON']['error'];
					if(error_string.length>0){
						self.SaveSuccessMsg(error_string);
					}else{
						self.SaveSuccessMsg('Oops! Something wrong happened.Try again later.')
					}
				} 
			});
		}
	};

	self.updateProductArea = function(){
		console.log(self.productAreaName());
		if(self.productAreaName()&&self.featureProductArea()){
			var data = {"name":self.productAreaName()};
			data = JSON.stringify(data);
			var headers = {'Content-type':'application/json'};
			var URL = productURL+self.featureProductArea().id()+"/";
			$.ajax({
				url:URL,type:'PUT',data:data,headers:headers,
				success:function(result){
					self.SaveSuccess(true);self.SaveSuccessMsg('Update successfull');
					setTimeout(function(){
						$('#productModal').modal('hide');self.updateClientList();
					},300);
				},
				error: function(jqXHR, textStatus, errorThrown){
					self.SaveSuccess(true);
					var error_string = "";
					error_string = jqXHR['responseJSON']['error'];
					if(error_string.length>0){
						self.SaveSuccessMsg(error_string);
					}else{
						self.SaveSuccessMsg('Oops! Something wrong happened.Try again later.')
					}
				}
			});
		}else{
			if(self.productAreaName()){
				self.SaveSuccessMsg('Select Product Area');self.SaveSuccess(true);
			}else{
				self.SaveSuccessMsg("New name can't be blank");self.SaveSuccess(true);
			}
		}
	};
	/*self.errors = ko.validation.group(self);
	console.log(self.errors())*/




	self.Query = ko.observable(''),self.searchList = ko.observableArray();



	self.textSearch = ko.computed({
		read:function(){
			var q = self.Query().toLowerCase();
			/*self.searchList(self.featureList().slice());*/
			if(q.length>0){
				var returnVal = self.featureList().filter(function(i) {
					return i.title().toLowerCase().indexOf(q) >= 0||i.description().toLowerCase().indexOf(q) >= 0||i.client().name().toLowerCase().indexOf(q) >= 0||
					i.clientPriority().toString().toLowerCase().indexOf(q) >= 0||i.targetDate().toLowerCase().indexOf(q) >= 0||i.productArea().name().toLowerCase().indexOf(q) >= 0;
				});
				return self.searchList(returnVal.slice());
			}else{
				return self.searchList(self.featureList().slice());
			}
		},
		write:function(value){
			console.log('value');
			self.searchList(value.slice());
		},
		owner:self
	});


	/********************        All Sortin function        ***********************/
	self.titleAsc = function(){
		self.textSearch(self.searchList().sort(function (a, b) {return a.title().toLowerCase() == b.title().toLowerCase() ? 0 : (a.title().toLowerCase() < b.title().toLowerCase() ? -1 : 1);}).slice());
	}

	self.descAsc = function(){
		self.textSearch(self.searchList().sort(function (a, b) {return a.description().toLowerCase() == b.description().toLowerCase() ? 0 : (a.description().toLowerCase() < b.description().toLowerCase() ? -1 : 1);}).slice());
	}

	self.cliAsc = function(){
		self.textSearch(self.searchList().sort(function (a, b) {return a.client().name().toLowerCase() == b.client().name().toLowerCase() ? 0 : (a.client().name().toLowerCase() < b.client().name().toLowerCase() ? -1 : 1);}).slice());
	}

	self.cpAsc = function(){
		self.textSearch(self.searchList().sort(function (a, b) {return a.clientPriority() == b.clientPriority() ? 0 : (a.clientPriority() < b.clientPriority() ? -1 : 1);}).slice());
	}

	self.paAsc = function(){
		self.textSearch(self.searchList().sort(function (a, b) {return a.productArea().name().toLowerCase() == b.productArea().name().toLowerCase() ? 0 : (a.productArea().name().toLowerCase() < b.productArea().name().toLowerCase() ? -1 : 1);}).slice());
	}

	self.tdAsc = function(){
		self.textSearch(self.searchList().sort(function (a, b) {return new Date(a.targetDate()) == new Date(b.targetDate()) ? 0 : (new Date(a.targetDate()) < new Date(b.targetDate()) ? -1 : 1);}).slice());
	}

	self.titleDesc = function(){
		self.textSearch(self.searchList().sort(function (a, b) {return a.title().toLowerCase() == b.title().toLowerCase() ? 0 : (a.title().toLowerCase() > b.title().toLowerCase() ? -1 : 1);}).slice());
	}

	self.descDesc = function(){
		self.textSearch(self.searchList().sort(function (a, b) {return a.description().toLowerCase() == b.description().toLowerCase() ? 0 : (a.description().toLowerCase() > b.description().toLowerCase() ? -1 : 1);}).slice());
	}

	self.cliDesc = function(){
		self.textSearch(self.searchList().sort(function (a, b) {return a.client().name().toLowerCase() == b.client().name().toLowerCase() ? 0 : (a.client().name().toLowerCase() > b.client().name().toLowerCase() ? -1 : 1);}).slice());
	}

	self.cpDesc = function(){
		self.textSearch(self.searchList().sort(function (a, b) {return a.clientPriority() == b.clientPriority() ? 0 : (a.clientPriority() > b.clientPriority() ? -1 : 1);}).slice());
	}

	self.paDesc = function(){
		self.textSearch(self.searchList().sort(function (a, b) {return a.productArea().name().toLowerCase() == b.productArea().name().toLowerCase() ? 0 : (a.productArea().name().toLowerCase() > b.productArea().name().toLowerCase() ? -1 : 1);}).slice());
	}

	self.tdDesc = function(){
		self.textSearch(self.searchList().sort(function (a, b) {return new Date(a.targetDate()) == new Date(b.targetDate()) ? 0 : (new Date(a.targetDate()) > new Date(b.targetDate()) ? -1 : 1);}).slice());
	}
};

clientViewModel.errors = ko.validation.group(clientViewModel);

var vm = new clientViewModel();
vm.updateClientList();
vm.updateProductList();
vm.updateFeatureList();

ko.applyBindingsWithValidation(vm);



/*self.clientPriority.extend({
		validation:{
			validator:function(val){
				var clientArray = ko.utils.arrayFilter(self.clientList(), function(client) {
					return parseInt(client.priority())===parseInt(val);
				});
				if(clientArray.length>0){
					return false;
				}
			},
			message:"Sorry!! Priority already exist."
		}
	});*/