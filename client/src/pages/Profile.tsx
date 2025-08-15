import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
      {user && (
        <div className="mt-8 bg-white p-8 rounded-lg shadow-md">
          <p className="text-lg">
            <strong>Name:</strong> {user.firstName} {user.lastName}
          </p>
          <p className="text-lg">
            <strong>Email:</strong> {user.email}
          </p>
          <p className="text-lg">
            <strong>Investment Amount:</strong> ${user.investmentAmount}
          </p>
          <p className="text-lg">
            <strong>Role:</strong> {user.role}
          </p>
        </div>
      )}
    </div>
  );
};

export default Profile;
