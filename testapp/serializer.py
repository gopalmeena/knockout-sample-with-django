from rest_framework import serializers

from .models import *

class FeatureSerializer(serializers.ModelSerializer):
	class Meta:
		model = Feature
		fields = ('id','title','description','client','client_priority','target_date','product_area')



class ClientSerializer(serializers.ModelSerializer):
	class Meta:
		model = Client
		fields = ('id','name')

class ProductSerializer(serializers.ModelSerializer):
	class Meta:
		model = Product
		fields = ('id','name')


class SearchSerializer(serializers.Serializer):
	query_string = serializers.CharField()