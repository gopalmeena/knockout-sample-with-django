# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from .models import *
from django.test import TestCase
from datetime import datetime

# Create your tests here.

class ClientTestCase(object):
	def setUp(self):
		Client.objects.create(name='TestClient')

	def test_client_name(self):
		client = Client.objects.get(id=1)
		self.assertEquals(client['name'],'TestClient')

class ProductTestCase(object):
	def setUp(self):
		Product.objects.create(name='TestProduct')

	def test_product_name(self):
		product = Product.objects.get(id=1)
		self.assertEquals(product['name'],'TestProduct')



class FeatureTestCase(object):
	def setUp(self):
		Feature.objects.create(title='Test Title',description='Test Description',client=1,client_priority=1,target_date=datetime.now().strfime('%Y-%m-%d'),product_area=1)

	def test_feature(self):
		feature = Feature.objects.get(id=1)
		self.assertEquals(feature['title'],'Test Title')
		self.assertEquals(feature['description'],'Test Description')
		self.assertEquals(feature['client'],1)
		self.assertEquals(feature['client_priority'],1)
		self.assertEquals(feature['target_date'],datetime.now().strfime('%Y-%m-%d'))
		self.assertEquals(feature['product_area'],1)
