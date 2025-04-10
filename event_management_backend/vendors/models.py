from django.db import models

class Vendor(models.Model):
    name = models.CharField(max_length=255)
    contact_info = models.TextField()
    services_offered = models.TextField()
    
    def __str__(self):
        return self.name
    
class EventVendor(models.Model):
    event = models.ForeignKey('events.Event', on_delete=models.CASCADE, related_name='event_vendors')
    vendor = models.ForeignKey('Vendor', on_delete=models.CASCADE, related_name='event_vendors')
    field = models.CharField(max_length=255)  # The role of the vendor in the event

    def __str__(self):
        return f"{self.vendor.name} - {self.event.name} ({self.field})"
