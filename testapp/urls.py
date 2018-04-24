from django.conf.urls import url,include
from rest_framework import routers


from .views import *

router = routers.DefaultRouter()


router.register(r'client',ClientViewSet,base_name='all_client')
router.register(r'search',SearchViewSet,base_name='search')
router.register(r'feature',FeatureViewSet,base_name='all_feature')
router.register(r'products',ProductaAreaViewSet,base_name='all_product_area')




urlpatterns = [
	url(r'^',include(router.urls)),
]