import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { supabase } from '../config/supabase';
import api from '../utils/api';
import Card from '../shared/Card';
import Button from '../shared/Button';
import Badge from '../shared/Badge';
import LoadingSpinner from '../shared/LoadingSpinner';
import { MessageSquare, Star, ArrowRight, RefreshCw, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [labId, setLabId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  // Fetch Lab ID
  useEffect(() => {
    async function fetchLabId() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('lab_partners')
          .select('id')
          .eq('owner_user_id', user.id)
          .single();

        if (error) throw error;
        setLabId(data.id);
      } catch (err) {
        console.error('Error fetching lab id:', err);
      }
    }
    fetchLabId();
  }, [user]);

  const loadReviews = async () => {
    if (!labId) return;
    setLoading(true);
    try {
      const res = await api.get(`/api/revenue/${labId}/reviews`);
      setReviews(res.data);
    } catch (err) {
      console.error('Error loading reviews:', err);
      toast.error('Failed to load patient reviews feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (labId) loadReviews();
  }, [labId]);

  const handleReplySubmit = async (e, reviewId) => {
    e.preventDefault();
    const text = replyText[reviewId];
    if (!text || !text.trim()) {
      toast.error('Reply text cannot be empty');
      return;
    }

    setSubmittingId(reviewId);
    try {
      await api.put(`/api/revenue/${labId}/reviews/${reviewId}/response`, {
        response_text: text
      });
      toast.success('Response reply submitted successfully!');
      
      // Clear specific reply state
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));
      loadReviews(); // Refresh review feed
    } catch (err) {
      toast.error(err.message || 'Failed to submit response reply');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReplyTextChange = (reviewId, val) => {
    setReplyText(prev => ({ ...prev, [reviewId]: val }));
  };

  if (!labId) return <LoadingSpinner text="Retrieving lab customer profiles..." />;

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.lab_rating || 0), 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="lab-reviews-page" style={{ padding: '16px 12px 80px', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="headline-lg">Customer Feedback</h1>
          <p className="body-md text-secondary">View patient star ratings and reply to review text reviews</p>
        </div>
        <Button variant="secondary" icon={<RefreshCw size={16} />} onClick={loadReviews}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner text="Aggregating rating reports..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Quick Average Card */}
          <Card style={{ padding: '20px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '12px', backgroundColor: '#FFF9C4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={28} fill="#FFB300" stroke="#FFB300" />
              </div>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>AVERAGE LAB RATING</span>
                <div style={{ fontSize: '28px', fontWeight: 'bold', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {avgRating} <span style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 500 }}>({reviews.length} Patient reviews)</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Feedback Queue */}
          <h2 className="title-md" style={{ margin: '12px 0 0', fontWeight: 600 }}>Review History Feed</h2>
          {reviews.length === 0 ? (
            <Card style={{ padding: '32px', textAlign: 'center', marginTop: '20px' }}>
              <MessageSquare size={40} className="text-muted" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p className="body-sm text-secondary" style={{ margin: 0 }}>No reviews received yet.</p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {reviews.map(rev => (
                <Card key={rev.id} style={{ padding: '18px', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
                        {rev.patient?.name || 'Anonymous Patient'}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        REF: {rev.bookings?.booking_number} • {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= rev.lab_rating ? '#FFB300' : 'none'}
                          stroke={star <= rev.lab_rating ? '#FFB300' : 'var(--outline-variant)'}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="body-sm" style={{ fontSize: '13px', margin: '8px 0 12px', lineHeight: 1.4, color: 'var(--on-surface)' }}>
                    "{rev.lab_review_text || 'No written comment left.'}"
                  </p>

                  {/* Phlebotomist Rating Sub-indicator */}
                  {rev.phlebotomist_rating && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--surface-container-low)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                      Collector Agent: {rev.phlebotomist_rating}⭐ {rev.phlebotomist_note && `("${rev.phlebotomist_note}")`}
                    </div>
                  )}

                  {/* Reply Response area */}
                  {rev.lab_response_text ? (
                    <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '12px', borderRadius: 'var(--radius-lg)', marginTop: '8px', borderLeft: '3px solid var(--primary)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--primary)' }}>
                        <span>Your Reply Response</span>
                        <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>
                          {new Date(rev.lab_responded_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {rev.lab_response_text}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={(e) => handleReplySubmit(e, rev.id)} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                      <input
                        type="text"
                        placeholder="Write a reply response to the patient review..."
                        value={replyText[rev.id] || ''}
                        onChange={(e) => handleReplyTextChange(rev.id, e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius)', fontSize: '12px', backgroundColor: 'var(--surface-container-lowest)' }}
                        required
                      />
                      <Button
                        type="submit"
                        size="sm"
                        variant="secondary"
                        loading={submittingId === rev.id}
                        icon={<Send size={12} />}
                      >
                        Reply
                      </Button>
                    </form>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
