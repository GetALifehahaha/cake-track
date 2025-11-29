from rest_framework import permissions

class IsCashier(permissions.BasePermission):
    
    def has_permission(self, request, view):
        print(request.user.groups)
        return request.user.groups.filter(name='cashier').exists()
    
class IsCustomerOrAdmin(permissions.BasePermission):
    
    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
        
        if request.user.groups.filter(name='cashier').exists():
            return False
        
        return True
    
class IsAdmin(permissions.BasePermission):
    
    def has_permission(self, request, view):
        if request.user.is_staff:
            return True
        
        return False