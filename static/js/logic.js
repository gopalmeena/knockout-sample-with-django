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

/* Client object declaration */
var Client = function(id,name){
	var self = this;
	self.name = ko.observable(name),self.id = ko.observable(id);
}

/* Feature object declaration */
var Feature = function(id,title,description,client,client_priority,target_date,product_area){
	var self = this;
	this.title = ko.observable(title),this.description = ko.observable(description),this.client = ko.observable(client);
	this.clientPriority = ko.observable(client_priority),this.targetDate = ko.observable(target_date),this.productArea = ko.observable(product_area),this.id = ko.observable(id);
}

/* Product object declaration */
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


	self.titleSort = ko.observable(0);self.descSort = ko.observable(0);self.clientSort = ko.observable(0);
	self.cliPriSort = ko.observable(1);self.proAreaSort = ko.observable(0);self.targetDateSort = ko.observable(0);

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

	/*Initially load all clients,products and features */
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
		self.addChangeToggle();self.clientName('');self.clientName.isModified(false);
	}
	self.updateClientToggle = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.updateChangeToggle();self.clientName('');self.clientName.isModified(false);
		self.featureClient('');self.featureClient.isModified(false);
	}
	self.deleteClientToggle = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.deleteChangeToggle();self.featureClient('');self.featureClient.isModified(false);
	}
	self.saveClient = function(){
		data = {"name":self.clientName()};
		$.post(clientURL,data,function(response,status){
			self.SaveSuccess(true);self.SaveSuccessMsg('Data Saved successfully.');
			setTimeout(function(){
				$('#clientModal').modal('hide');self.updateClientList();
			},100);
		}).fail(function(response,status){
			self.SaveSuccess(true);self.SaveSuccessMsg('Something Wrong happened. Try again!');
		});
	}

	/* Refresh data in client modal */
	self.refreshClient = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.clientName('');self.clientName.isModified(false);
	};

	self.deleteClient = function(val){
		if(self.featureClient()){
			var URL = clientURL+self.featureClient().id();
			$.ajax({
				url:URL,type:'DELETE',
				success:function(result){
					self.SaveSuccess(true);self.SaveSuccessMsg('Client deleted successfully.');
					setTimeout(function(){
						$('#clientModal').modal('hide');self.updateClientList();self.updateFeatureList();
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
						self.SaveSuccessMsg('Oops! Something went wrong.Try again later.')
					}
				}
			});
		}else{
			self.SaveSuccess(true);self.SaveSuccessMsg('Select Client first');
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
						$('#clientModal').modal('hide');self.updateClientList();self.updateFeatureList();
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
						self.SaveSuccessMsg('Oops! Something went wrong.Try again later.')
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

	self.featureTitle.subscribe(function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	})
	self.featureDescription.subscribe(function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	})
	self.featureClient.subscribe(function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	})
	self.featureProductArea.subscribe(function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	})
	self.featureTargetDate.subscribe(function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	})
	self.clientPriority.subscribe(function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
	})

	self.refreshFeature = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.featureTitle('');self.featureTitle.isModified(false);
		self.featureDescription('');self.featureDescription.isModified(false);
		self.featureClient('');self.featureClient.isModified(false);
		self.featureProductArea('');self.featureProductArea.isModified(false);
		self.featureTargetDate('');self.featureTargetDate.isModified(false);
		self.clientPriority('');self.clientPriority.isModified(false);
	}

	self.addFeatureToggle = function(){
		self.addChangeToggle();
		self.refreshFeature();
	}
	self.updateFeatureToggle = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.updateChangeToggle();
	}
	self.deleteFeatureToggle = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.deleteChangeToggle();
	}

	self.saveFeature = function(){
		if(self.featureTargetDate() && self.featureTitle()&& self.featureDescription() && self.featureClient() && self.featureProductArea() && self.clientPriority()){
			if(self.featureTargetDate.isValid() && self.featureTitle.isValid()&& self.featureDescription.isValid() && self.featureClient.isValid() && self.featureProductArea.isValid() && self.clientPriority.isValid()){
				var target_date = self.featureTargetDate();
				target_date = target_date.split('/');target_date = target_date[2]+'-'+target_date[0]+'-'+target_date[1];
				var data = {"title":self.featureTitle(),"description":self.featureDescription(),"client":self.featureClient().id(),"target_date":target_date,"product_area":self.featureProductArea().id(),"client_priority":self.clientPriority()};
				data = JSON.stringify(data);
				var headers = {'Content-type':'application/json'};
				$.ajax({
					url:featureURL,type:'post',headers:headers,data:data,
					success: function(){
						self.SaveSuccess(true);self.SaveSuccessMsg('Feature Saved successfully.')
						setTimeout(function(){
							$('#featureModal').modal('hide');self.updateFeatureList();
						},300);
					},
					error: function(response){
						var error_string = "";response = response.responseJSON;
						if(response.isArray){
							for (var i=0;i<response.length;i++){
								Object.keys(response[i]).forEach(function(key) {
									error_string += response[i][key];
								})
							}
						}
						if(error_string.length===0){
							error_string = response['error'];
						}
						self.SaveSuccess(true);
						if(error_string.length>0){
							self.SaveSuccessMsg(error_string);
						}else{
							self.SaveSuccessMsg('Oops! Something went wrong.Try again later.')
						}
					}
				});
			}else{
				self.SaveSuccess(true);
				if(self.featureTitle.isValid()===false){
					self.SaveSuccessMsg('Title is invalid.')
				}else if(self.featureClient.isValid()===false){
					self.SaveSuccessMsg('Client is invalid.')
				}else if(self.clientPriority.isValid()===false){
					self.SaveSuccessMsg('Client Priority is invalid.')
				}else if(self.featureTargetDate.isValid()===false){
					self.SaveSuccessMsg('Target Date is invalid.')
				}else if(self.featureProductArea.isValid()===false){
					self.SaveSuccessMsg('Product Area is invalid.')
				}else if(self.featureDescription.isValid()===false){
					self.SaveSuccessMsg('Description is invalid.')
				};
			}
		}else{
			self.SaveSuccess(true);
			if(self.featureTitle()===''){
				self.SaveSuccessMsg('Title is missing.')
			}else if(self.featureClient()===undefined){
				self.SaveSuccessMsg('Client is missing.')
			}else if(self.clientPriority()===''){
				self.SaveSuccessMsg('Client Priority is missing.')
			}else if(self.featureTargetDate()===''){
				self.SaveSuccessMsg('Target Date is missing.')
			}else if(self.featureProductArea()===undefined){
				self.SaveSuccessMsg('Product Area is missing.')
			}else if(self.featureDescription()===''){
				self.SaveSuccessMsg('Description is missing.')
			};
		}
	};

	self.updateFeature = function(val){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		$('#featureModal').modal('show');
		self.featureId(val.id());
		self.updateFeatureToggle();
		self.featureTitle(val.title());self.featureTitle.isModified(false);
		self.featureClient(val.client());self.featureClient.isModified(false);
		self.featureTargetDate(val.targetDate());self.featureTargetDate.isModified(false);
		self.featureProductArea(val.productArea());self.featureProductArea.isModified(false);
		self.featureDescription(val.description());self.featureDescription.isModified(false);
		self.clientPriority(val.clientPriority());self.clientPriority.isModified(false);
	};

	self.updateFeatureItem = function(){
		var target_date = self.featureTargetDate();
		target_date = target_date.split('/');target_date = target_date[2]+'-'+target_date[0]+'-'+target_date[1];
		var data = {"title":self.featureTitle(),"description":self.featureDescription(),"client":self.featureClient().id(),"target_date":target_date,"product_area":self.featureProductArea().id(),"client_priority":self.clientPriority()};
		data = JSON.stringify(data);
		var headers = {'Content-type':'application/json'};
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
		self.featureTitle(val.title());self.featureTitle.isModified(false);
		self.featureClient(val.client());self.featureClient.isModified(false);
		self.featureTargetDate(val.targetDate());self.featureTargetDate.isModified(false);
		self.featureProductArea(val.productArea());self.featureProductArea.isModified(false);
		self.featureDescription(val.description());self.featureDescription.isModified(false);
		self.clientPriority(val.clientPriority());self.clientPriority.isModified(false);
		document.getElementById("selectFeatureClient").disabled = true;
		document.getElementById("selectFeatureProduct").disabled = true;
	};

	self.deleteFeatureItem = function(val){
		var url = featureURL+self.featureId()+"/";
		$.ajax({
			url:url,type:'DELETE',
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
					self.SaveSuccessMsg('Oops! Something went wrong.Try again later.')
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
		self.addChangeToggle();self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.featureProductArea('');self.featureProductArea.isModified(false);
		self.productAreaName('');self.productAreaName.isModified(false);
	}
	self.updateProductToggle = function(){
		self.updateChangeToggle();self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.featureProductArea('');self.featureProductArea.isModified(false);
		self.productAreaName('');self.productAreaName.isModified(false);
	}
	self.deleteProductToggle = function(){
		self.deleteChangeToggle();self.SaveSuccess(false);self.SaveSuccessMsg('');
	}
	self.saveProductArea = function(){
		self.productAreaName.isValid();
		var data = {"name":self.productAreaName()};
		$.post(productURL,data,function(response,status){
			self.SaveSuccess(true);self.SaveSuccessMsg('Product area Saved successfully.');
			setTimeout(function(){
				$('#productModal').modal('hide');self.updateProductList();
			},300);
		}).fail(function(response,status){
			self.SaveSuccess(true);
			self.SaveSuccessMsg('Something Wrong happened. Try again!');
		});

	};

	self.refreshProductArea = function(){
		self.SaveSuccess(false);self.SaveSuccessMsg('');
		self.productAreaName('');self.productAreaName.isModified(false);
	};

	self.deleteProductArea = function(val){
		if(self.featureProductArea()!==undefined){
			var URL = productURL+self.featureProductArea().id();
			$.ajax({
				url:URL,type:'DELETE',
				success:function(result){
					self.SaveSuccess(true);self.SaveSuccessMsg('Delete successfull');
					setTimeout(function(){
						$('#productModal').modal('hide');self.updateProductList();self.updateFeatureList();
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
			self.SaveSuccess(true);
			self.SaveSuccessMsg('Choose client First');
		}
	};

	self.updateProductArea = function(){
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
						$('#productModal').modal('hide');self.updateProductList();self.updateFeatureList();
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
	/*self.errors = ko.validation.group(self);*/




	self.Query = ko.observable(''),self.searchList = ko.observableArray();



	self.textSearch = ko.computed({
		read:function(){
			var q = self.Query().toLowerCase();
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
			self.searchList(value.slice());
		},
		owner:self
	});


	/********************        All Sortin function        ***********************/
	self.titleAsc = function(){
		self.descSort(0),self.clientSort(0),self.cliPriSort(0);self.proAreaSort(0);self.targetDateSort(0);

		if(self.titleSort()===0||self.titleSort()===2){
			self.titleSort(1);
			self.textSearch(self.searchList().sort(function (a, b) {return a.title().toLowerCase() == b.title().toLowerCase() ? 0 : (a.title().toLowerCase() < b.title().toLowerCase() ? -1 : 1);}).slice());
		}else{
			self.titleSort(2);
			self.textSearch(self.searchList().sort(function (a, b) {return a.title().toLowerCase() == b.title().toLowerCase() ? 0 : (a.title().toLowerCase() > b.title().toLowerCase() ? -1 : 1);}).slice());
		}
	}

	self.descAsc = function(){
		self.titleSort(0),self.clientSort(0),self.cliPriSort(0);self.proAreaSort(0);self.targetDateSort(0);
		if(self.descSort()===0||self.descSort()===2){
			self.descSort(1);
			self.textSearch(self.searchList().sort(function (a, b) {return a.description().toLowerCase() == b.description().toLowerCase() ? 0 : (a.description().toLowerCase() < b.description().toLowerCase() ? -1 : 1);}).slice());
		}else{
			self.descSort(2);
			self.textSearch(self.searchList().sort(function (a, b) {return a.description().toLowerCase() == b.description().toLowerCase() ? 0 : (a.description().toLowerCase() > b.description().toLowerCase() ? -1 : 1);}).slice());
		}
	}

	self.cliAsc = function(){
		self.titleSort(0),self.descSort(0),self.cliPriSort(0);self.proAreaSort(0);self.targetDateSort(0);
		if(self.clientSort()===0||self.clientSort()===2){
			self.clientSort(1);
			self.textSearch(self.searchList().sort(function (a, b) {return a.client().name().toLowerCase() == b.client().name().toLowerCase() ? 0 : (a.client().name().toLowerCase() < b.client().name().toLowerCase() ? -1 : 1);}).slice());
		}else{
			self.clientSort(2);
			self.textSearch(self.searchList().sort(function (a, b) {return a.client().name().toLowerCase() == b.client().name().toLowerCase() ? 0 : (a.client().name().toLowerCase() > b.client().name().toLowerCase() ? -1 : 1);}).slice());
		}
	}

	self.cpAsc = function(){
		self.titleSort(0),self.descSort(0),self.clientSort(0),self.proAreaSort(0);self.targetDateSort(0);
		if(self.cliPriSort()===0||self.cliPriSort()===2){
			self.cliPriSort(1);
			self.textSearch(self.searchList().sort(function (a, b) {return a.clientPriority() == b.clientPriority() ? 0 : (a.clientPriority() < b.clientPriority() ? -1 : 1);}).slice());
		}else{
			self.cliPriSort(2);
			self.textSearch(self.searchList().sort(function (a, b) {return a.clientPriority() == b.clientPriority() ? 0 : (a.clientPriority() > b.clientPriority() ? -1 : 1);}).slice());
		}
	}

	self.paAsc = function(){
		self.titleSort(0),self.descSort(0),self.clientSort(0),self.cliPriSort(0),self.targetDateSort(0);
		if(self.proAreaSort()===0||self.proAreaSort()===2){
			self.proAreaSort(1);
			self.textSearch(self.searchList().sort(function (a, b) {return a.productArea().name().toLowerCase() == b.productArea().name().toLowerCase() ? 0 : (a.productArea().name().toLowerCase() < b.productArea().name().toLowerCase() ? -1 : 1);}).slice());
		}else{
			self.proAreaSort(2);
			self.textSearch(self.searchList().sort(function (a, b) {return a.productArea().name().toLowerCase() == b.productArea().name().toLowerCase() ? 0 : (a.productArea().name().toLowerCase() > b.productArea().name().toLowerCase() ? -1 : 1);}).slice());
		}
	}

	self.tdAsc = function(){
		self.titleSort(0),self.descSort(0),self.clientSort(0),self.cliPriSort(0);self.proAreaSort(0);
		if(self.targetDateSort()===0||self.targetDateSort()===2){
			self.targetDateSort(1);
			self.textSearch(self.searchList().sort(function (a, b) {return new Date(a.targetDate()) == new Date(b.targetDate()) ? 0 : (new Date(a.targetDate()) < new Date(b.targetDate()) ? -1 : 1);}).slice());
		}else{
			self.targetDateSort(2);
			self.textSearch(self.searchList().sort(function (a, b) {return new Date(a.targetDate()) == new Date(b.targetDate()) ? 0 : (new Date(a.targetDate()) > new Date(b.targetDate()) ? -1 : 1);}).slice());
		}
	}
};

clientViewModel.errors = ko.validation.group(clientViewModel,{deep:true});

var vm = new clientViewModel();
vm.updateClientList();
vm.updateProductList();
vm.updateFeatureList();

ko.applyBindingsWithValidation(vm);