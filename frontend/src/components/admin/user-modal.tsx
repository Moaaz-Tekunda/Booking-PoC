'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Calendar, 
  Building, 
  Eye, 
  EyeOff,
  UserPlus,
  Edit3
} from 'lucide-react';
import { User as UserType, UserCreate, UserUpdate, Gender, Role } from '@/types/user';
import { useCreateUser, useUpdateUser } from '@/hooks/use-users';
import { useAuth } from '@/hooks/use-auth';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserType;
  mode: 'create' | 'edit';
}

export default function UserModal({ isOpen, onClose, user, mode }: UserModalProps) {
  const { user: currentUser } = useAuth();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: 18,
    mobile_number: '',
    job_type: '',
    gender: 'male' as Gender,
    role: 'viewer' as Role,
    hotel_id: '',
    is_active: true,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        age: user.age,
        mobile_number: user.mobile_number,
        job_type: user.job_type || '',
        gender: user.gender,
        role: user.role,
        hotel_id: user.hotel_id || '',
        is_active: user.is_active,
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        email: '',
        password: '',
        age: 18,
        mobile_number: '',
        job_type: '',
        gender: 'male',
        role: 'viewer',
        hotel_id: '',
        is_active: true,
      });
    }
  }, [mode, user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'create') {
        const userData: UserCreate = {
          ...formData,
          hotel_id: formData.hotel_id || undefined,
          job_type: formData.job_type || undefined,
        };
        await createUserMutation.mutateAsync(userData);
      } else if (mode === 'edit' && user) {
        const userData: UserUpdate = {
          ...formData,
          hotel_id: formData.hotel_id || undefined,
          job_type: formData.job_type || undefined,
        };
        delete (userData as any).password; // Remove password from update
        await updateUserMutation.mutateAsync({ userId: user.id, userData });
      }
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value
    }));
  };

  const canModifyRole = currentUser?.role === 'super_admin';
  const canModifyHotelId = currentUser?.role === 'super_admin';

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide bg-card/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode === 'create' ? (
              <UserPlus className="h-6 w-6 text-primary" />
            ) : (
              <Edit3 className="h-6 w-6 text-primary" />
            )}
            <h2 className="text-xl font-semibold text-foreground">
              {mode === 'create' ? 'Create New User' : 'Edit User'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {mode === 'create' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full pr-12 pl-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                      placeholder="Enter password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="tel"
                    name="mobile_number"
                    value={formData.mobile_number}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Age *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="120"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Job Type
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  name="job_type"
                  value={formData.job_type}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground"
                  placeholder="Enter job type"
                />
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Role & Permissions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={!canModifyRole}
                  required
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground disabled:opacity-50"
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin_hotel">Hotel Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                {!canModifyRole && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Only super admins can modify roles
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Hotel ID
                </label>
                <input
                  type="text"
                  name="hotel_id"
                  value={formData.hotel_id}
                  onChange={handleInputChange}
                  disabled={!canModifyHotelId}
                  className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground disabled:opacity-50"
                  placeholder="Enter hotel ID (optional)"
                />
                {!canModifyHotelId && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Only super admins can assign hotel IDs
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary/50 focus:ring-2"
              />
              <label className="text-sm font-medium text-foreground">
                Active user
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
