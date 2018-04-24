# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models

# Create your models here.


class Client(models.Model):
	name = models.CharField(max_length=100,blank=False,null=False)

	def __unicode__(self):
		return self.name

class Product(models.Model):
	name = models.CharField(max_length=100,blank=False,null=False)

	def __unicode__(self):
		return self.name


class Feature(models.Model):
	title = models.CharField(max_length=50,blank=False,null=False)
	description = models.CharField(max_length=800,blank=True,null=True)
	client = models.ForeignKey('Client',related_name='Client',on_delete=models.CASCADE)
	client_priority = models.IntegerField(default=0,blank=False,null=False)
	target_date = models.DateField()
	product_area = models.ForeignKey('Product',related_name='Product',on_delete=models.CASCADE)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)