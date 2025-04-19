// client/src/components/CreatePost.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaRegClock, FaClock } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';

const MAX_LENGTH = 280; // Twitter's character limit

const CreatePost = ({ onSubmit }) => {
  const [text, setText] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [cronExpression, setCronExpression] = useState('0 12 * * *'); // Default: 12:00 PM daily
  const [cronDescription, setCronDescription] = useState('Every day at 12:00 PM');
  
  // Calculate remaining characters
  const remainingChars = MAX_LENGTH - text.length;
  const charCountClass = remainingChars < 20 
    ? 'danger' 
    : remainingChars < 50 
      ? 'warning' 
      : '';
  
  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (text.trim() === '') {
      return;
    }
    
    const postData = {
      text,
      scheduled,
      scheduledTime: scheduled ? scheduledTime.toISOString() : null,
      cronExpression: (scheduled && recurring) ? cronExpression : null,
      cronDescription: (scheduled && recurring) ? cronDescription : null
    };
    
    onSubmit(postData);
    
    // Reset form
    setText('');
    setScheduled(false);
    setRecurring(false);
  };
  
  // Predefined cron schedules
  const predefinedSchedules = [
    { expression: '0 9 * * *', description: 'Every day at 9:00 AM' },
    { expression: '0 12 * * *', description: 'Every day at 12:00 PM' },
    { expression: '0 18 * * *', description: 'Every day at 6:00 PM' },
    { expression: '0 9 * * 1-5', description: 'Weekdays at 9:00 AM' },
    { expression: '0 12 * * 1-5', description: 'Weekdays at 12:00 PM' },
    { expression: '0 18 * * 1-5', description: 'Weekdays at 6:00 PM' },
    { expression: '0 10 * * 6,0', description: 'Weekends at 10:00 AM' },
    { expression: '0 0 1 * *', description: 'First day of each month at midnight' },
  ];
  
  // Update cron expression and description
  const handleCronChange = (event) => {
    const selected = event.target.value;
    const schedule = predefinedSchedules.find(s => s.expression === selected);
    setCronExpression(selected);
    setCronDescription(schedule ? schedule.description : '');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Post text input */}
      <div>
        <label htmlFor="post-text" className="sr-only">Post content</label>
        <textarea
          id="post-text"
          className="textarea h-24"
          placeholder="What's happening?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LENGTH}
          required
        />
        <div className={`char-counter text-right ${charCountClass}`}>
          {remainingChars} characters remaining
        </div>
      </div>
      
      {/* Schedule options */}
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="schedule"
          className="w-4 h-4 text-twitter-blue focus:ring-twitter-blue rounded"
          checked={scheduled}
          onChange={() => setScheduled(!scheduled)}
        />
        <label htmlFor="schedule" className="font-medium">
          Schedule this post
        </label>
      </div>
      
      {/* Schedule time picker (visible only when scheduled) */}
      {scheduled && (
        <div className="bg-gray-50 dark:bg-twitter-darker p-4 rounded-lg border border-gray-200 dark:border-twitter-border">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <FaCalendarAlt className="mr-2 text-twitter-blue" />
              <label htmlFor="scheduled-time" className="font-medium">
                Schedule Time
              </label>
            </div>
            <DatePicker
              id="scheduled-time"
              selected={scheduledTime}
              onChange={date => setScheduledTime(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              className="input"
              placeholderText="Select date and time"
            />
          </div>
          
          <div className="border-t border-gray-200 dark:border-twitter-border pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="recurring"
                className="w-4 h-4 text-twitter-blue focus:ring-twitter-blue rounded"
                checked={recurring}
                onChange={() => setRecurring(!recurring)}
              />
              <label htmlFor="recurring" className="font-medium flex items-center">
                <FaClock className="mr-2 text-twitter-blue" />
                Make this a recurring post
              </label>
            </div>
            
            {recurring && (
              <div>
                <label htmlFor="cron-schedule" className="block mb-2 font-medium">
                  Select frequency:
                </label>
                <select
                  id="cron-schedule"
                  className="input"
                  value={cronExpression}
                  onChange={handleCronChange}
                >
                  {predefinedSchedules.map(schedule => (
                    <option key={schedule.expression} value={schedule.expression}>
                      {schedule.description}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
          disabled={text.trim() === ''}
        >
          {scheduled ? 'Schedule Post' : 'Post Now'}
        </button>
      </div>
    </form>
  );
};

export default CreatePost;