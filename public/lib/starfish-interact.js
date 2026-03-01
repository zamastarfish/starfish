/**
 * starfish-interact.js
 * Unified input capture → parameter mapping for generative art
 * Framework-agnostic, works with p5, vanilla canvas, anything
 */

export function createInteraction(element, options = {}) {
  const rect = () => element.getBoundingClientRect();
  
  // State
  const state = {
    // Position (normalized 0-1)
    x: 0.5,
    y: 0.5,
    // Raw position (pixels)
    rawX: 0,
    rawY: 0,
    // Velocity (pixels/frame, smoothed)
    velocity: 0,
    velocityX: 0,
    velocityY: 0,
    // Direction of movement (radians)
    angle: 0,
    // Distance from center (normalized 0-1, where 1 = corner)
    distanceFromCenter: 0,
    // Dwell time at current position (ms)
    dwell: 0,
    // Pressure (0-1, if supported)
    pressure: 0,
    // Interaction state
    isDown: false,
    isDragging: false,
    // Touch-specific
    touches: 0,
    pinchScale: 1,
    pinchRotation: 0,
    // Timing
    lastMoveTime: 0,
    downTime: 0,
  };
  
  // Previous frame state for velocity calculation
  let prevX = 0, prevY = 0;
  let prevTime = performance.now();
  
  // Dwell tracking
  let dwellX = 0, dwellY = 0, dwellStart = 0;
  const dwellThreshold = options.dwellThreshold ?? 10; // pixels
  
  // Smoothing
  const smoothing = options.smoothing ?? 0.15;
  let smoothVelocity = 0;
  
  // Event listeners
  const listeners = {
    move: [],
    down: [],
    up: [],
    drag: [],
    tap: [],
    swipe: [],
    pinch: [],
  };
  
  // Multi-touch tracking
  let touchCache = [];
  let lastPinchDist = 0;
  let lastPinchAngle = 0;
  
  function updatePosition(clientX, clientY, pressure = 0.5) {
    const r = rect();
    const now = performance.now();
    const dt = now - prevTime;
    
    state.rawX = clientX - r.left;
    state.rawY = clientY - r.top;
    state.x = state.rawX / r.width;
    state.y = state.rawY / r.height;
    state.pressure = pressure;
    
    // Velocity calculation
    if (dt > 0) {
      const dx = state.rawX - prevX;
      const dy = state.rawY - prevY;
      const instantVel = Math.sqrt(dx * dx + dy * dy) / dt * 16; // normalize to ~60fps
      smoothVelocity = smoothVelocity * (1 - smoothing) + instantVel * smoothing;
      state.velocity = smoothVelocity;
      state.velocityX = dx / dt * 16;
      state.velocityY = dy / dt * 16;
      
      // Direction
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        state.angle = Math.atan2(dy, dx);
      }
    }
    
    // Distance from center
    const cx = state.x - 0.5;
    const cy = state.y - 0.5;
    state.distanceFromCenter = Math.sqrt(cx * cx + cy * cy) * Math.SQRT2; // normalize so corners = 1
    
    // Dwell tracking
    const movedDist = Math.sqrt(
      Math.pow(state.rawX - dwellX, 2) + 
      Math.pow(state.rawY - dwellY, 2)
    );
    if (movedDist > dwellThreshold) {
      dwellX = state.rawX;
      dwellY = state.rawY;
      dwellStart = now;
    }
    state.dwell = now - dwellStart;
    
    state.lastMoveTime = now;
    prevX = state.rawX;
    prevY = state.rawY;
    prevTime = now;
    
    // Emit events
    emit('move', { ...state });
    if (state.isDragging) {
      emit('drag', { ...state, dx: state.velocityX, dy: state.velocityY });
    }
  }
  
  function handleDown(clientX, clientY, pressure) {
    state.isDown = true;
    state.isDragging = false;
    state.downTime = performance.now();
    updatePosition(clientX, clientY, pressure);
    emit('down', { ...state });
  }
  
  function handleMove(clientX, clientY, pressure) {
    if (state.isDown && !state.isDragging) {
      // Start dragging after small movement
      const dx = clientX - rect().left - prevX;
      const dy = clientY - rect().top - prevY;
      if (Math.sqrt(dx * dx + dy * dy) > 3) {
        state.isDragging = true;
      }
    }
    updatePosition(clientX, clientY, pressure);
  }
  
  function handleUp(clientX, clientY) {
    const duration = performance.now() - state.downTime;
    const wasDragging = state.isDragging;
    
    state.isDown = false;
    state.isDragging = false;
    
    // Detect tap vs swipe
    if (!wasDragging && duration < 300) {
      emit('tap', { x: state.x, y: state.y, rawX: state.rawX, rawY: state.rawY });
    } else if (wasDragging && state.velocity > 5) {
      // Swipe detection
      const direction = 
        Math.abs(Math.cos(state.angle)) > Math.abs(Math.sin(state.angle))
          ? (Math.cos(state.angle) > 0 ? 'right' : 'left')
          : (Math.sin(state.angle) > 0 ? 'down' : 'up');
      emit('swipe', { direction, velocity: state.velocity, angle: state.angle });
    }
    
    emit('up', { ...state });
  }
  
  // Mouse events
  element.addEventListener('mousedown', (e) => {
    handleDown(e.clientX, e.clientY, 0.5);
  });
  
  element.addEventListener('mousemove', (e) => {
    handleMove(e.clientX, e.clientY, e.pressure || 0.5);
  });
  
  element.addEventListener('mouseup', (e) => {
    handleUp(e.clientX, e.clientY);
  });
  
  element.addEventListener('mouseleave', () => {
    if (state.isDown) {
      handleUp(state.rawX, state.rawY);
    }
  });
  
  // Touch events
  element.addEventListener('touchstart', (e) => {
    e.preventDefault();
    touchCache = Array.from(e.touches);
    state.touches = touchCache.length;
    
    if (touchCache.length === 1) {
      const t = touchCache[0];
      handleDown(t.clientX, t.clientY, t.force || 0.5);
    } else if (touchCache.length === 2) {
      // Initialize pinch
      lastPinchDist = getTouchDistance(touchCache);
      lastPinchAngle = getTouchAngle(touchCache);
    }
  }, { passive: false });
  
  element.addEventListener('touchmove', (e) => {
    e.preventDefault();
    touchCache = Array.from(e.touches);
    state.touches = touchCache.length;
    
    if (touchCache.length === 1) {
      const t = touchCache[0];
      handleMove(t.clientX, t.clientY, t.force || 0.5);
    } else if (touchCache.length === 2) {
      // Pinch handling
      const dist = getTouchDistance(touchCache);
      const angle = getTouchAngle(touchCache);
      
      state.pinchScale = dist / lastPinchDist;
      state.pinchRotation = angle - lastPinchAngle;
      
      emit('pinch', { 
        scale: state.pinchScale, 
        rotation: state.pinchRotation,
        center: getTouchCenter(touchCache, rect())
      });
      
      lastPinchDist = dist;
      lastPinchAngle = angle;
    }
  }, { passive: false });
  
  element.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (e.touches.length === 0) {
      handleUp(state.rawX, state.rawY);
    }
    touchCache = Array.from(e.touches);
    state.touches = touchCache.length;
  }, { passive: false });
  
  // Touch helpers
  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  function getTouchAngle(touches) {
    return Math.atan2(
      touches[1].clientY - touches[0].clientY,
      touches[1].clientX - touches[0].clientX
    );
  }
  
  function getTouchCenter(touches, r) {
    return {
      x: ((touches[0].clientX + touches[1].clientX) / 2 - r.left) / r.width,
      y: ((touches[0].clientY + touches[1].clientY) / 2 - r.top) / r.height,
    };
  }
  
  // Event system
  function on(event, callback) {
    if (listeners[event]) {
      listeners[event].push(callback);
    }
    return () => off(event, callback);
  }
  
  function off(event, callback) {
    if (listeners[event]) {
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    }
  }
  
  function emit(event, data) {
    if (listeners[event]) {
      listeners[event].forEach(cb => cb(data));
    }
  }
  
  // Parameter mapping
  function map(source, min, max, options = {}) {
    const { clamp = true, ease = null } = options;
    let value = state[source] ?? 0;
    
    // Apply easing
    if (ease === 'quad') value = value * value;
    if (ease === 'sqrt') value = Math.sqrt(value);
    if (ease === 'sin') value = Math.sin(value * Math.PI / 2);
    
    // Map to range
    let result = min + value * (max - min);
    
    // Clamp
    if (clamp) {
      result = Math.max(min, Math.min(max, result));
    }
    
    return result;
  }
  
  // Decay velocity when not moving
  function tick() {
    const now = performance.now();
    if (now - state.lastMoveTime > 50) {
      smoothVelocity *= 0.9;
      state.velocity = smoothVelocity;
    }
  }
  
  // Public API
  return {
    // State (read-only getters)
    get x() { return state.x; },
    get y() { return state.y; },
    get rawX() { return state.rawX; },
    get rawY() { return state.rawY; },
    get velocity() { return state.velocity; },
    get velocityX() { return state.velocityX; },
    get velocityY() { return state.velocityY; },
    get angle() { return state.angle; },
    get distanceFromCenter() { return state.distanceFromCenter; },
    get dwell() { return state.dwell; },
    get pressure() { return state.pressure; },
    get isDown() { return state.isDown; },
    get isDragging() { return state.isDragging; },
    get touches() { return state.touches; },
    get pinchScale() { return state.pinchScale; },
    get pinchRotation() { return state.pinchRotation; },
    
    // Methods
    map,
    on,
    off,
    tick, // Call in animation loop to decay velocity
    
    // Direct state access (for advanced use)
    state,
  };
}

/**
 * Parameter system for mapping interactions to named values
 */
export function createParams(interaction, schema) {
  const params = {};
  const smoothed = {};
  
  // Initialize from schema
  for (const [name, config] of Object.entries(schema)) {
    smoothed[name] = config.default ?? (config.range[0] + config.range[1]) / 2;
  }
  
  function update() {
    for (const [name, config] of Object.entries(schema)) {
      const { source, range, smooth = 0, ease = null } = config;
      
      // Get raw value from interaction
      let raw = interaction.map(source, range[0], range[1], { ease });
      
      // Apply smoothing
      if (smooth > 0) {
        smoothed[name] = smoothed[name] * (1 - smooth) + raw * smooth;
        params[name] = smoothed[name];
      } else {
        params[name] = raw;
      }
    }
    
    return params;
  }
  
  return {
    update,
    get: (name) => params[name],
    all: () => ({ ...params }),
  };
}
