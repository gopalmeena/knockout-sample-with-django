# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from django.db.models import Q

from rest_framework import status,viewsets
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response

from .serializer import *
from.models import *


# Create your views here.

class ClientViewSet(viewsets.ViewSet):

	def get_objects(self,pk):
		try:
			return Client.objects.get(id=pk)
		except Exception as e:
			raise Http404

	def list(self,request):
		client = Client.objects.all()
		serializer_obj = ClientSerializer(client,many=True)
		return Response(serializer_obj.data)

	def create(self,request):
		serializer_obj = ClientSerializer(data=request.data)
		if serializer_obj.is_valid():
			if Client.objects.filter(name__iexact=request.data['name']):
				return Response({'name':'already present'},status=status.HTTP_400_BAD_REQUEST)
			else:
				serializer_obj.save()
				return Response(serializer_obj.data,status=status.HTTP_201_CREATED)
		return Response(serializer_obj.errors,status=status.HTTP_400_BAD_REQUEST)

	def update(self,request,pk,format=None):
		client = self.get_objects(pk)
		serializer_obj = ClientSerializer(client,data=request.data)
		if serializer_obj.is_valid():
			serializer_obj.save()
			return Response(serializer_obj.data)
		return Response(serializer_obj.errors,status=status.HTTP_400_BAD_REQUEST)

	def destroy(self,request,pk):
		client = self.get_objects(pk)
		client.delete()
		return	Response(status = status.HTTP_204_NO_CONTENT)

class ProductaAreaViewSet(viewsets.ViewSet):

	def get_objects(self,pk):
		try:
			return Product.objects.get(id=pk)
		except Product.DoesNotExit:
			raise Http404

	def list(self,request):
		product = Product.objects.all()
		serializer_obj = ProductSerializer(product,many=True)
		return Response(serializer_obj.data)

	def create(self,request):
		serializer_obj = ProductSerializer(data=request.data)
		if serializer_obj.is_valid():
			if Product.objects.filter(name__iexact=request.data['name']):
				return Response({'name':'already present'},status=status.HTTP_400_BAD_REQUEST)
			else:
				serializer_obj.save()
				return Response(serializer_obj.data,status=status.HTTP_201_CREATED)
		return Response(serializer_obj.errors,status=status.HTTP_400_BAD_REQUEST)

	def update(self,request,pk,format=None):
		product = self.get_objects(pk)
		serializer_obj = ProductSerializer(product,data=request.data)
		if serializer_obj.is_valid():
			serializer_obj.save()
			return Response(serializer_obj.data)
		return Response(serializer_obj.errors,status=status.HTTP_400_BAD_REQUEST)

	def destroy(self,request,pk):
		product = self.get_objects(pk)
		product.delete()
		return	Response(status = status.HTTP_204_NO_CONTENT)
		

class FeatureViewSet(viewsets.ViewSet):

	@staticmethod
	def get_objects(pk):
		try:
			return Feature.objects.get(id=pk)
		except Feature.DoesNotExit:
			raise Http404

	def list(self,request):
		feature = Feature.objects.all().order_by('client_priority','target_date')
		serializer = FeatureSerializer(feature,many=True)
		return Response(serializer.data)

	def create(self,request):
		serializer = FeatureSerializer(data=request.data)
		if serializer.is_valid():
			if Feature.objects.filter(Q(title__iexact=request.data['title'],client__id=int(request.data['client']))):
				return Response({'error':'Duplication of title for same client'},status=status.HTTP_400_BAD_REQUEST)
			elif Feature.objects.filter(Q(client__id=int(request.data['client']),client_priority=request.data['client_priority'])):
				features_list = Feature.objects.filter(Q(client__id=int(request.data['client']),client_priority__gte=request.data['client_priority'])).order_by('client_priority')
				if features_list:
					priority_value = int(request.data['client_priority'])
					for features in features_list:
						if features.client_priority == priority_value:
							features.client_priority = priority_value+1
							features.save()
							priority_value = priority_value+1
						else:
							break
				serializer.save()
				return Response(serializer.data,status=status.HTTP_201_CREATED)
			else:
				serializer.save()
				return Response(serializer.data,status=status.HTTP_201_CREATED)
		return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

	def update(self,request,pk,format=None):
		feature = self.get_objects(pk)
		serializer = FeatureSerializer(feature,data=request.data)
		if serializer.is_valid():
			if Feature.objects.filter(Q(client__id=int(request.data['client']),client_priority=request.data['client_priority'])):
				features_list = Feature.objects.filter(Q(client__id=int(request.data['client']),client_priority__gte=request.data['client_priority'])).order_by('client_priority')
				if features_list:
					priority_value = int(request.data['client_priority'])
					for features in features_list:
						if features.client_priority == priority_value:
							features.client_priority = priority_value+1
							features.save()
							priority_value = priority_value+1
						else:
							break
				serializer.save()
				return Response(serializer.data,status=status.HTTP_201_CREATED)
			else:
				serializer.save()
			return Response(serializer.data)
		return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

	def destroy(self,request,pk):
		feature = self.get_objects(pk)
		feature.delete()
		return	Response(status = status.HTTP_204_NO_CONTENT)


class SearchViewSet(viewsets.ViewSet):

	def list(self,request):
		data1 = request.query_params
		serializers = SearchSerializer(data=data1)
		if serializers.is_valid():
			qyery_str = data1['query_string']
			features = Feature.objects.filter(Q(title__icontains=qyery_str)|Q(description__icontains=qyery_str)|Q(target_date__icontains=qyery_str)|Q(Product__name__icontains=qyery_str)|Q(Client__name__icontains=qyery_str)|Q(client_priority__icontains=qyery_str)).order_by('client_priority')
			serializerss = FeatureSerializer(features,many=True)
			if serializerss.is_valid:
				return Response(serializerss.data)
			return Response(serializerss.errors,status=status.HTTP_400_BAD_REQUEST)
		else:
			return Response(serializers.errors,status=status.HTTP_400_BAD_REQUEST)