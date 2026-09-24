from rest_framework import serializers
from .models import Property, Unit


class UnitSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.name', read_only=True)

    class Meta:
        model = Unit
        fields = ['id', 'property', 'property_name', 'code', 'monthly_rent', 'is_occupied']


class PropertySerializer(serializers.ModelSerializer):
    units = UnitSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = ['id', 'name', 'address', 'units']