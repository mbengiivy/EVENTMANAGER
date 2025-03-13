from django.db import models

class Vendor(models.Model):
    name = models.CharField(max_length=255)
    contact_info = models.TextField()
    services_offered = models.TextField()

    def __str__(self):
        return self.name