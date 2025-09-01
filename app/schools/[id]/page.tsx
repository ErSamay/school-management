'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

interface School {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  contact: string;
  image: string | null;
  email_id: string;
  created_at: string;
}

export default function SchoolDetail() {
  const params = useParams();
  const router = useRouter();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchSchool();
    }
  }, [params.id]);

  const fetchSchool = async () => {
    try {
      const response = await fetch(`/api/schools/${params.id}`);
      const data = await response.json();
      
      if (data.success) {
        setSchool(data.school);
      } else {
        setError('School not found');
      }
    } catch (err) {
      setError('Failed to load school details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${school?.name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/schools?id=${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        alert('School deleted successfully!');
        router.push('/schools');
      } else {
        alert('Failed to delete school');
      }
    } catch (error) {
      alert('Error deleting school');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <Link href="/schools" className="mt-4 text-blue-600 hover:text-blue-800">
            ← Back to Schools
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link
            href="/schools"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Schools
          </Link>
        </div>

        {/* School Details Card */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header Image */}
          <div className="relative h-64 sm:h-80 bg-gray-200">
            {school.image ? (
              <Image
                src={school.image}
                alt={school.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-100 to-blue-200">
                <div className="text-center">
                  <svg className="w-20 h-20 text-blue-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-blue-600 font-bold text-xl">{school.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* School Information */}
          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">
                {school.name}
              </h1>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Link
                  href={`/edit-school/${school.id}`}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-200"
                >
                  Edit School
                </Link>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-200"
                >
                  Delete School
                </button>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</h3>
                  <p className="mt-1 text-lg text-gray-900">{school.address}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">City</h3>
                    <p className="mt-1 text-lg text-gray-900">{school.city}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">State</h3>
                    <p className="mt-1 text-lg text-gray-900">{school.state}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Contact Number</h3>
                  <a href={`tel:${school.contact}`} className="mt-1 text-lg text-blue-600 hover:text-blue-800">
                    {school.contact}
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email</h3>
                  <a href={`mailto:${school.email_id}`} className="mt-1 text-lg text-blue-600 hover:text-blue-800">
                    {school.email_id}
                  </a>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Added On</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {new Date(school.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Info Section */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`tel:${school.contact}`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Call School
                </a>
                
                <a
                  href={`mailto:${school.email_id}`}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  Send Email
                </a>

                <Link
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(school.address + ' ' + school.city + ' ' + school.state)}`}
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  View on Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}