import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase/config';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/ClubInternal.css';

const ClubInternal = () => {
  const { clubId } = useParams();
  const { currentUser } = useAuth();
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newResource, setNewResource] = useState({ title: '', description: '', link: '' });
  const [isAddingResource, setIsAddingResource] = useState(false);

  useEffect(() => {
    loadClubData();
  }, [clubId]);

  const loadClubData = async () => {
    try {
      const clubDoc = await getDoc(doc(db, 'clubs', clubId));
      if (clubDoc.exists()) {
        setClub(clubDoc.data());
        await Promise.all([
          loadMembers(clubDoc.data().members || []),
          loadJoinRequests(),
          loadResources()
        ]);
      }
    } catch (error) {
      console.error('Error loading club data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async (memberIds) => {
    try {
      const memberProfiles = [];
      for (const memberId of memberIds) {
        const memberDoc = await getDoc(doc(db, 'users', memberId));
        if (memberDoc.exists()) {
          memberProfiles.push({
            id: memberId,
            ...memberDoc.data()
          });
        }
      }
      setMembers(memberProfiles);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadJoinRequests = async () => {
    try {
      const requestsQuery = query(
        collection(db, 'joinRequests'),
        where('clubId', '==', clubId),
        where('status', '==', 'pending')
      );
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = [];
      
      for (const requestDoc of requestsSnapshot.docs) {
        const userData = await getDoc(doc(db, 'users', requestDoc.data().userId));
        if (userData.exists()) {
          requests.push({
            id: requestDoc.id,
            ...requestDoc.data(),
            user: userData.data()
          });
        }
      }
      
      setJoinRequests(requests);
    } catch (error) {
      console.error('Error loading join requests:', error);
    }
  };

  const loadResources = async () => {
    try {
      const resourcesQuery = query(
        collection(db, 'resources'),
        where('clubId', '==', clubId)
      );
      const resourcesSnapshot = await getDocs(resourcesQuery);
      setResources(resourcesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    } catch (error) {
      console.error('Error loading resources:', error);
    }
  };

  const handleJoinRequest = async (requestId, status) => {
    try {
      const request = joinRequests.find(r => r.id === requestId);
      if (!request) return;

      await updateDoc(doc(db, 'joinRequests', requestId), { status });
      
      if (status === 'approved') {
        const updatedMembers = [...(club.members || []), request.userId];
        await updateDoc(doc(db, 'clubs', clubId), {
          members: updatedMembers
        });
        await loadMembers(updatedMembers);
      }
      
      await loadJoinRequests();
    } catch (error) {
      console.error('Error handling join request:', error);
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    try {
      const resourceData = {
        ...newResource,
        clubId,
        createdAt: new Date().toISOString(),
        createdBy: currentUser.uid
      };
      
      await addDoc(collection(db, 'resources'), resourceData);
      setNewResource({ title: '', description: '', link: '' });
      setIsAddingResource(false);
      await loadResources();
    } catch (error) {
      console.error('Error adding resource:', error);
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const confirmed = window.confirm('Are you sure you want to remove this member?');
      if (!confirmed) return;

      const updatedMembers = club.members.filter(id => id !== memberId);
      await updateDoc(doc(db, 'clubs', clubId), {
        members: updatedMembers
      });
      await loadMembers(updatedMembers);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="club-internal-container">
      <div className="internal-header">
        <h1>{club.name} - Internal Page</h1>
      </div>

      <div className="internal-content">
        {/* Join Requests Section */}
        <section className="internal-section">
          <h2>Join Requests</h2>
          <div className="requests-list">
            {joinRequests.map(request => (
              <div key={request.id} className="request-item">
                <img
                  src={request.user.photoUrl || '/default-avatar.png'}
                  alt={request.user.name}
                  className="request-avatar"
                />
                <div className="request-info">
                  <h3>{request.user.name}</h3>
                  <p>{request.user.email}</p>
                  <p className="request-message">{request.message}</p>
                </div>
                <div className="request-actions">
                  <button
                    className="approve-button"
                    onClick={() => handleJoinRequest(request.id, 'approved')}
                  >
                    Approve
                  </button>
                  <button
                    className="reject-button"
                    onClick={() => handleJoinRequest(request.id, 'rejected')}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
            {joinRequests.length === 0 && (
              <p className="no-data">No pending join requests</p>
            )}
          </div>
        </section>

        {/* Members Section */}
        <section className="internal-section">
          <h2>Members</h2>
          <div className="members-grid">
            {members.map(member => (
              <div key={member.id} className="member-card">
                <img
                  src={member.photoUrl || '/default-avatar.png'}
                  alt={member.name}
                  className="member-avatar"
                />
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p>{member.email}</p>
                  {member.major && <p className="member-major">{member.major}</p>}
                  {member.graduationYear && (
                    <p className="member-year">Class of {member.graduationYear}</p>
                  )}
                </div>
                {currentUser.uid === club.president && member.id !== club.president && (
                  <div className="member-actions">
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Resources Section */}
        <section className="internal-section">
          <h2>Internal Resources</h2>
          <button
            className="add-resource-button"
            onClick={() => setIsAddingResource(true)}
          >
            + Add Resource
          </button>
          
          {isAddingResource && (
            <form onSubmit={handleAddResource} className="resource-form">
              <input
                type="text"
                placeholder="Resource Title"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Resource Description"
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                required
              />
              <input
                type="url"
                placeholder="Resource Link"
                value={newResource.link}
                onChange={(e) => setNewResource({ ...newResource, link: e.target.value })}
                required
              />
              <div className="form-actions">
                <button type="submit">Save Resource</button>
                <button
                  type="button"
                  onClick={() => setIsAddingResource(false)}
                  className="cancel-button"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="resources-grid">
            {resources.map(resource => (
              <div key={resource.id} className="resource-card">
                <h3>{resource.title}</h3>
                <p>{resource.description}</p>
                <a
                  href={resource.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-link"
                >
                  View Resource
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ClubInternal; 