// supabase/functions/n8n-task-proxy/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  const startTime = Date.now();
  console.log('=== N8N TASK PROXY START ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Processing main request...');

  try {
    // Parse the request body
    console.log('Parsing request body...');
    const requestData = await req.json();
    console.log('=== REQUEST DATA RECEIVED ===');
    console.log('Full request data:', JSON.stringify(requestData, null, 2));

    // Enhanced validation for both old and new request formats
    console.log('Validating required fields...');
    
    // Support both 'operation' (old format) and 'action' (new format)
    const operation = requestData.operation || requestData.action;
    const userEmail = requestData.userEmail;
    
    console.log('Operation/Action:', operation);
    console.log('UserEmail:', userEmail);
    
    if (!operation || !userEmail) {
      console.error('=== VALIDATION ERROR ===');
      console.error('Missing required fields - operation/action:', !!operation, 'userEmail:', !!userEmail);
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields: operation/action and userEmail',
          received: {
            operation: requestData.operation || 'missing',
            action: requestData.action || 'missing',
            userEmail: requestData.userEmail || 'missing'
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // CRITICAL FIX: Always send 'operation' to N8N (convert action -> operation)
    const normalizedRequestData = {
      operation: operation, // Always use 'operation' for N8N
      userEmail: userEmail,
      // Include any other fields from the original request
      ...requestData
    };

    // Remove 'action' field to avoid confusion
    if (normalizedRequestData.action) {
      delete normalizedRequestData.action;
    }

    console.log('=== NORMALIZED REQUEST DATA FOR N8N ===');
    console.log('Normalized for N8N:', JSON.stringify(normalizedRequestData, null, 2));

    // Forward request to N8N webhook
    const n8nUrl = 'https://brinkenauto.app.n8n.cloud/webhook/task-management';
    console.log('=== FORWARDING TO N8N ===');
    console.log('Target URL:', n8nUrl);
    console.log('Request payload:', JSON.stringify(normalizedRequestData, null, 2));
    console.log('Request timestamp:', new Date().toISOString());

    const fetchStartTime = Date.now();
    const n8nResponse = await fetch(n8nUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedRequestData),
    });
    const fetchDuration = Date.now() - fetchStartTime;

    console.log('=== N8N RESPONSE RECEIVED ===');
    console.log('Response status:', n8nResponse.status);
    console.log('Response statusText:', n8nResponse.statusText);
    console.log('Response ok:', n8nResponse.ok);
    console.log('Fetch duration (ms):', fetchDuration);
    console.log('Response headers:', Object.fromEntries(n8nResponse.headers.entries()));

    if (!n8nResponse.ok) {
      console.error('=== N8N REQUEST FAILED ===');
      console.error('Status:', n8nResponse.status);
      console.error('StatusText:', n8nResponse.statusText);
      
      let errorText = '';
      try {
        errorText = await n8nResponse.text();
        console.error('Error response body:', errorText);
      } catch (textError) {
        console.error('Could not read error response body:', textError);
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'N8N workflow request failed',
          status: n8nResponse.status,
          statusText: n8nResponse.statusText,
          errorBody: errorText,
          url: n8nUrl,
          timestamp: new Date().toISOString(),
          requestData: normalizedRequestData
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get response from N8N
    console.log('Parsing N8N response JSON...');
    let n8nData;
    try {
      n8nData = await n8nResponse.json();
      console.log('=== N8N RESPONSE DATA ===');
      console.log('Response type:', typeof n8nData);
      console.log('Response structure:', JSON.stringify(n8nData, null, 2));
      
      // Enhanced response validation
      if (n8nData && typeof n8nData === 'object') {
        console.log('Response validation:');
        console.log('- Has success property:', 'success' in n8nData);
        console.log('- Success value:', n8nData.success);
        console.log('- Has tasks property:', 'tasks' in n8nData);
        console.log('- Has error property:', 'error' in n8nData);
        
        if (n8nData.tasks) {
          console.log('- Tasks is array:', Array.isArray(n8nData.tasks));
          console.log('- Tasks length:', n8nData.tasks.length);
          if (Array.isArray(n8nData.tasks) && n8nData.tasks.length > 0) {
            console.log('- First task sample:', n8nData.tasks[0]);
          }
        }
        
        if (n8nData.error) {
          console.log('- Error message:', n8nData.error);
        }
      }
    } catch (parseError) {
      console.error('=== JSON PARSE ERROR ===');
      console.error('Parse error:', parseError);
      console.error('Response was not valid JSON');
      
      // Try to get raw text
      try {
        const rawText = await n8nResponse.text();
        console.error('Raw response text:', rawText);
      } catch (textError) {
        console.error('Could not read raw text:', textError);
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'N8N response was not valid JSON',
          parseError: parseError.message,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Return successful response
    const totalDuration = Date.now() - startTime;
    console.log('=== RETURNING SUCCESS RESPONSE ===');
    console.log('Total processing duration (ms):', totalDuration);
    console.log('Final response data:', JSON.stringify(n8nData, null, 2));
    console.log('=== N8N TASK PROXY END ===');
    
    return new Response(
      JSON.stringify(n8nData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    const totalDuration = Date.now() - startTime;
    console.error('=== EDGE FUNCTION ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Total duration before error (ms):', totalDuration);
    console.error('=== N8N TASK PROXY ERROR END ===');
    
    return new Response(
      JSON.stringify({ 
        error: 'Proxy server error',
        message: error.message,
        errorType: error.constructor.name,
        timestamp: new Date().toISOString(),
        duration: totalDuration
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});