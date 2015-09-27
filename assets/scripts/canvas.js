
function canvas_init_pre() {
  prop.canvas={};

  prop.canvas.contexts={};

  prop.canvas.panY=0;
  prop.canvas.panX=0;

  // resize canvas to fit window?
  prop.canvas.resize=true;
  prop.canvas.size={ // all canvases are the same size
    height:480,
    width:640
  };

  prop.canvas.last = time();

  prop.canvas.dirty = true;
}

function canvas_init() {
  canvas_add("navaids");
  canvas_add("info");
  canvas_add("aircraft");
  canvas_add("compass");
}

function canvas_adjust_hidpi() {
  dpr = window.devicePixelRatio || 1;
  console.log("devicePixelRatio:"+dpr);
  if(dpr > 1) {
    hidefCanvas = $("#navaids-canvas").get(0);
    w = $(hidefCanvas).width();
    h = $(hidefCanvas).height();
    $(hidefCanvas).attr('width', w * dpr);
    $(hidefCanvas).attr('height', h * dpr);
    $(hidefCanvas).css('width', w );
    $(hidefCanvas).css('height', h );
    ctx = hidefCanvas.getContext("2d");
    ctx.scale(dpr, dpr);
    prop.canvas.contexts["navaids"] = ctx;
  }
}

function canvas_complete() {
  setTimeout(function() {
    prop.canvas.dirty = true;
  }, 500);
  prop.canvas.last = time();
}

function canvas_resize() {
  if(prop.canvas.resize) {
    prop.canvas.size.width  = $(window).width();
    prop.canvas.size.height = $(window).height();
  }
  prop.canvas.size.width  -= 250;
  prop.canvas.size.height -= 36;
  for(var i in prop.canvas.contexts) {
    prop.canvas.contexts[i].canvas.height=prop.canvas.size.height;
    prop.canvas.contexts[i].canvas.width=prop.canvas.size.width;
  }
  prop.canvas.dirty = true;
  canvas_adjust_hidpi();
}

function canvas_add(name) {
  $("#canvases").append("<canvas id='"+name+"-canvas'></canvas>");
  prop.canvas.contexts[name]=$("#"+name+"-canvas").get(0).getContext("2d");
}

function canvas_get(name) {
  return(prop.canvas.contexts[name]);
}

function canvas_clear(cc) {
  cc.clearRect(0,0,prop.canvas.size.width,prop.canvas.size.height);
}

function canvas_should_draw() {
  var elapsed = time() - prop.canvas.last;
  if(elapsed > (1/prop.game.speedup)) {
    prop.canvas.last = time();
    return true;
  }
  return false;
}

// DRAW

function canvas_draw_runway(cc, runway, mode) {
  var length2 = round(km(runway.length / 2));
  var angle   = runway.angle;

  var size  = 20;
  var size2 = size / 2;

  cc.translate(round(km(runway.position[0])) + prop.canvas.panX, -round(km(runway.position[1])) + prop.canvas.panY);

  cc.rotate(angle);

  if(!mode) {
    cc.strokeStyle = "#899";
    cc.lineWidth = 2.8;
    cc.beginPath();
    cc.moveTo(0, -length2);
    cc.lineTo(0,  length2);
    cc.stroke();
  } else {
    cc.strokeStyle = "#465";

    var ils = null;

    if(runway.ils[1] && runway.ils_distance[1]) {
      ils = runway.ils_distance[1];
      cc.lineWidth = 3;
    } else {
      ils = 40;
      cc.lineWidth = 0.8;
    }

    cc.beginPath();
    cc.moveTo(0, -length2);
    cc.lineTo(0, -length2 - km(ils));
    cc.stroke();

    if(runway.ils[0] && runway.ils_distance[0]) {
      ils = runway.ils_distance[0];
      cc.lineWidth = 3;
    } else {
      ils = 40;
      cc.lineWidth = 0.8;
    }

    cc.beginPath();
    cc.moveTo(0,  length2);
    cc.lineTo(0,  length2 + km(ils));
    cc.stroke();

  }
}

function canvas_draw_runway_label(cc, runway) {
  var length2 = round(km(runway.length / 2)) + 0.5;
  var angle   = runway.angle;

  cc.translate(round(km(runway.position[0])) + prop.canvas.panX, -round(km(runway.position[1])) + prop.canvas.panY);

  cc.rotate(angle);

  var text_height = 14;
  cc.textAlign    = "center";
  cc.textBaseline = "middle";

  cc.save();
  cc.translate(0,  length2 + text_height);
  cc.rotate(-angle);
  cc.translate(round(km(runway.name_offset[0][0])), -round(km(runway.name_offset[0][1])));
  cc.fillText(runway.name[0], 0, 0);
  cc.restore();

  cc.save();
  cc.translate(0, -length2 - text_height);
  cc.rotate(-angle);
  cc.translate(round(km(runway.name_offset[1][0])), -round(km(runway.name_offset[1][1])));
  cc.fillText(runway.name[1], 0, 0);
  cc.restore();

}

function canvas_draw_runways(cc) {
  cc.strokeStyle = "rgba(255, 255, 255, 0.4)";
  cc.fillStyle   = "rgba(255, 255, 255, 0.4)";
  cc.lineWidth   = 4;
  var airport=airport_get();
  for(var i=0;i<airport.runways.length;i++) {
    cc.save();
    canvas_draw_runway(cc, airport.runways[i], true);
    cc.restore();
  }
  for(var i=0;i<airport.runways.length;i++) {
    cc.save();
    canvas_draw_runway(cc, airport.runways[i], false);
    cc.restore();
  }
}

function canvas_draw_runway_labels(cc) {
  cc.fillStyle   = "rgba(255, 255, 255, 0.8)";
  var airport=airport_get();
  for(var i=0;i<airport.runways.length;i++) {
    cc.save();
    canvas_draw_runway_label(cc, airport.runways[i]);
    cc.restore();
  }
}

function canvas_draw_scale(cc) {
  cc.fillStyle   = "rgba(255, 255, 255, 0.8)";
  cc.strokeStyle = "rgba(255, 255, 255, 0.8)";

  var offset = 10;
  var height = 5;

  var length = round(1 / prop.ui.scale * 50)
  var px_length = round(km(length));

  cc.translate(0.5, 0.5);

  cc.lineWidth = 1;
  cc.beginPath();
  cc.moveTo(prop.canvas.size.width - offset, offset);
  cc.lineTo(prop.canvas.size.width - offset, offset + height);
  cc.lineTo(prop.canvas.size.width - offset - px_length, offset + height);
  cc.lineTo(prop.canvas.size.width - offset - px_length, offset);
  cc.stroke();

  cc.translate(-0.5, -0.5);

  cc.textAlign = 'center';
  cc.fillText(length + ' km', prop.canvas.size.width - offset - px_length * 0.5, offset + height + 17);
}

function canvas_draw_fix(cc, name, fix) {
  cc.beginPath();
  cc.moveTo( 0, -5);
  cc.lineTo( 4,  3);
  cc.lineTo(-4,  3);
  cc.closePath();
  cc.fill();

  cc.textAlign    = "center";
  cc.textBaseline = "top";
  cc.fillText(name, 0, 6);
}

function canvas_draw_fixes(cc) {
  cc.strokeStyle = "rgba(255, 255, 255, 0.4)";
  cc.fillStyle   = "rgba(255, 255, 255, 0.4)";
  cc.lineWidth   = 2;
  cc.lineJoin    = "round";
  cc.font = "10px monoOne, monospace";
  var airport=airport_get();
  for(var i in airport.fixes) {
    cc.save();
    cc.translate(round(km(airport.fixes[i][0])) + prop.canvas.panX, -round(km(airport.fixes[i][1])) + prop.canvas.panY);
    canvas_draw_fix(cc, i, airport.fixes[i]);
    cc.restore();
  }
}

function canvas_draw_separation_indicator(cc, aircraft) {
  // Draw a trailing indicator 2.5 NM (4.6km) behind landing aircraft to help with traffic spacing
  var rwy = airport_get().getRunway(aircraft.requested.runway);
  var angle = rwy.getAngle(aircraft.requested.runway);
  cc.strokeStyle = "rgba(224, 128, 128, 0.8)";
  cc.lineWidth = 3;
  cc.translate(km(aircraft.position[0]) + prop.canvas.panX, -km(aircraft.position[1]) + prop.canvas.panY);
  cc.rotate(angle);
  cc.beginPath();
  cc.moveTo(-5, -km(4.6));
  cc.lineTo(+5, -km(4.6));
  cc.stroke();
}

function canvas_draw_aircraft_departure_window(cc, aircraft) {
  cc.save();
  cc.strokeStyle = "rgba(128, 255, 255, 0.9)";
  cc.beginPath();
  var angle = aircraft.destination - Math.PI/2;
  cc.arc(prop.canvas.panX,
         prop.canvas.panY,
         km(airport_get().ctr_radius),
         angle - 0.08726,
         angle + 0.08726);
  cc.stroke();
  cc.restore();
}

function canvas_draw_aircraft(cc, aircraft) {
  var almost_match = false;
  var match        = false;

  if ((prop.input.callsign.length > 1) &&
      (aircraft.matchCallsign(prop.input.callsign.substr(0, prop.input.callsign.length - 1))))
  {
    almost_match = true;
  }
  if((prop.input.callsign.length > 0) &&
     (aircraft.matchCallsign(prop.input.callsign)))
  {
    match = true;
  }

  if (match && (aircraft.destination != null)) {
    canvas_draw_aircraft_departure_window(cc, aircraft);
  }

  if(!aircraft.isVisible()) return;

  var size = 3;

  // Trailling
  var trailling_length = 12;
  dpr = window.devicePixelRatio || 1;
  if (dpr > 1) 
    trailling_length *= round(dpr);
  cc.restore();

  cc.save();
  if (!aircraft.inside_ctr)
    cc.fillStyle   = "rgb(224, 224, 224)";
  else
    cc.fillStyle = "rgb(255, 255, 255)";

  length = aircraft.position_history.length;
  for (i = 0; i < length; i++) {
    if (!aircraft.inside_ctr)
      cc.globalAlpha = 0.3 / (length - i);
    else
      cc.globalAlpha = 1 / (length - i);
    cc.fillRect(km(aircraft.position_history[i][0]) + prop.canvas.panX, -km(aircraft.position_history[i][1]) + prop.canvas.panY, 2, 2);
  }
  cc.restore();

  cc.save();
  if(aircraft.position_history.length > trailling_length) aircraft.position_history = aircraft.position_history.slice(aircraft.position_history.length - trailling_length, aircraft.position_history.length);

  if( aircraft.isPrecisionGuided() && aircraft.altitude > 1000) {
    cc.save();
    canvas_draw_separation_indicator(cc, aircraft);
    cc.restore();
  }

  // Aircraft
  // Draw the future path
  if((aircraft.warning || match) && !aircraft.isTaxiing()) {
    canvas_draw_future_track(cc, aircraft);
  }

  if (!aircraft.inside_ctr)
    cc.fillStyle   = "rgba(224, 224, 224, 0.3)";
  else if (almost_match)
    cc.fillStyle = "rgba(224, 210, 180, 1.0)";
  else if (match)
    cc.fillStyle = "rgba(255, 255, 255, 1.0)";
  else if (aircraft.warning)
    cc.fillStyle = "rgba(224, 128, 128, 1.0)";
  else if (aircraft.hit)
    cc.fillStyle = "rgba(255, 64, 64, 1.0)";
  else
    cc.fillStyle   = "rgba(224, 224, 224, 1.0)";

  cc.strokeStyle = cc.fillStyle;

  if(match) {

    cc.save();

    if (!aircraft.inside_ctr)
      cc.fillStyle = "rgba(255, 255, 255, 0.3)";
    else
      cc.fillStyle = "rgba(255, 255, 255, 1.0)";

    var t = crange(0, distance2d(
      [clamp(-w, km(aircraft.position[0]), w), clamp(-h, -km(aircraft.position[1]), h)],
      [          km(aircraft.position[0]),               -km(aircraft.position[1])    ]), 30,
                  0, 50);
    var w = prop.canvas.size.width/2 -  t;
    var h = prop.canvas.size.height/2 - t;

    cc.translate(clamp(-w, km(aircraft.position[0]) + prop.canvas.panX, w), clamp(-h, -km(aircraft.position[1]) + prop.canvas.panY, h));

    cc.beginPath();
    cc.arc(0, 0, round(size * 1.5), 0, Math.PI * 2);
    cc.fill();

    cc.restore();
  }
  
  cc.translate(km(aircraft.position[0]) + prop.canvas.panX, -km(aircraft.position[1]) + prop.canvas.panY);

  if(!aircraft.hit) {
    cc.save();

    var tail_length = 10;
    if(match) tail_length = 15;
    var angle       = aircraft.heading;
    var end         = [-sin(angle) * tail_length, cos(angle) * tail_length];

    cc.beginPath();
    cc.moveTo(0, 0);
    cc.lineTo(end[0], end[1]);
    cc.stroke();
    cc.restore();
  }

  if(aircraft.notice) {
    cc.save();
    cc.strokeStyle = cc.fillStyle;
    cc.beginPath();
    cc.arc(0, 0, km(4.8), 0, Math.PI * 2);
    cc.stroke();
    cc.restore();
  }

  cc.beginPath();
  cc.arc(0, 0, size, 0, Math.PI * 2);
  cc.fill();
}

// Run physics updates into the future, draw future track
function canvas_draw_future_track(cc, aircraft) {
  var twin = $.extend(true, {}, aircraft);
  twin.projected = true;
  save_delta = prop.game.delta;
  prop.game.delta = 5;
  future_track = [];
  for(i = 0; i < 60; i++) {
    twin.update();
    ils_locked = twin.requested.runway && twin.category == "arrival" && twin.mode == "landing";
    future_track.push([twin.position[0], twin.position[1], ils_locked]);
    if( ils_locked && twin.altitude < 500)
      break;
  }
  prop.game.delta = save_delta;
  cc.save();

  if(aircraft.category == "departure") {
    cc.strokeStyle = "rgba(128, 255, 255, 0.6)";
  } else {
    cc.strokeStyle = "rgba(224, 128, 128, 0.6)";
    lockedStroke   = "rgba(224, 128, 128, 1.0)";
  }
  cc.globalCompositeOperation = "screen";
  
  cc.lineWidth = 2;
  cc.beginPath();
  was_locked = false;
  length = future_track.length;
  for (i = 0; i < length; i++) {
      ils_locked = future_track[i][2];
      x = km(future_track[i][0]) + prop.canvas.panX ;
      y = -km(future_track[i][1]) + prop.canvas.panY;
      if(ils_locked && !was_locked) {
        cc.lineTo(x, y);
        cc.stroke(); // end the current path, start a new path with lockedStroke
        cc.strokeStyle = lockedStroke;
        cc.lineWidth = 3;
        cc.beginPath();
        cc.moveTo(x, y);
        was_locked = true;
        continue;
      }
      if( i==0 )
        cc.moveTo(x, y);
      else 
        cc.lineTo(x, y);
  }
  cc.stroke();
  canvas_draw_future_track_fixes(cc, twin, future_track);
  cc.restore();
}

// Draw dashed line from last coordinate of future track through
// any later requested fixes.
function canvas_draw_future_track_fixes( cc, aircraft, future_track) {
  if (aircraft.requested.fix.length == 0) return;
  var start = future_track.length - 1;
  var x = km(future_track[start][0]) + prop.canvas.panX;
  var y = -km(future_track[start][1]) + prop.canvas.panY;
  cc.beginPath();
  cc.moveTo(x, y);
  cc.setLineDash([3,10]);
  for(i=0; i<aircraft.requested.fix.length; i++) {
    var fix = airport_get().getFix(aircraft.requested.fix[i]);
    var fx = km(fix[0]) + prop.canvas.panX;
    var fy = -km(fix[1]) + prop.canvas.panY;
    cc.lineTo(fx, fy);
  }
  cc.stroke();
}

function canvas_draw_all_aircraft(cc) {
  cc.fillStyle   = "rgba(224, 224, 224, 1.0)";
  cc.strokeStyle = "rgba(224, 224, 224, 1.0)";
  cc.lineWidth   = 2;
  // console.time('canvas_draw_all_aircraft')
  for(var i=0;i<prop.aircraft.list.length;i++) {
    cc.save();
    canvas_draw_aircraft(cc, prop.aircraft.list[i]);
    cc.restore();
  }
  // console.timeEnd('canvas_draw_all_aircraft')
}

function canvas_draw_info(cc, aircraft) {
  var html = aircraft.dataBlock.html;
  if(!aircraft.isVisible()) {
    html.first().css({
      visibility: 'hidden'
    });
    return;
  }

  var altitude = lpad(round(aircraft.altitude * 0.01), 2);
  var trend = '-';
  var speed = lpad(round(aircraft.speed * 0.1), 2);

  if(aircraft.trend != 0) {
    if(aircraft.trend < 0) {
      if(aircraft.requested.expedite && aircraft.mode != "landing") {
        trend = '&#8609;';
      } else trend = '&darr;';
    } else if(aircraft.trend > 0) {
      if(aircraft.requested.expedite && aircraft.mode != "landing") {
        trend = '&#8607;';
      } else trend = '&uarr;';
    }
  }

  if ((altitude != aircraft.dataBlock.altitude) ||
      (trend != aircraft.dataBlock.trend) ||
      (speed != aircraft.dataBlock.speed))
  {
    aircraft.dataBlock.altitude = altitude;
    aircraft.dataBlock.trend = trend;
    aircraft.dataBlock.speed = speed;
    html.find('.data').html(aircraft.dataBlock.callsign + '<br>' +
                           altitude + ' ' + trend + ' ' + speed);
  }

  if (!aircraft.dataBlock.dragging) {
    html.first().css({
      visibility: 'visible',
      left: round(km(aircraft.position[0])) +
        aircraft.dataBlock.offset.left +
        round(cc.canvas.width / 2) +
        prop.canvas.panX + 'px',
      top: -round(km(aircraft.position[1])) +
        aircraft.dataBlock.offset.top +
        round(cc.canvas.height / 2) +
        prop.canvas.panY + 'px'});
  }

  html.toggleClass('inside_ctr', aircraft.inside_ctr);
  html.toggleClass('arrival', aircraft.category == "arrival");
  html.toggleClass('departure', aircraft.category == "departure");
  html.toggleClass('selected',(prop.input.callsign.length > 0 &&
                               aircraft.matchCallsign(prop.input.callsign)));

  if (aircraft.mode == "landing") {
    html.find('.icon').toggleClass('locked', true);
    html.find('.icon').removeClass('approach');
  }
  else if (aircraft.requested.runway && aircraft.category == "arrival") {
    html.find('.icon').toggleClass('approach', true);
    html.find('.icon').removeClass('locked');
  }
  else {
    html.find('.icon').removeClass('approach locked');
  }

  // Draw a line from the aircraft to the datablock
  var datablock_diagonal_angle = Math.atan2(html.width(), html.height());
  var line_angle = Math.atan2(aircraft.dataBlock.offset.left + (html.width() / 2),
                              aircraft.dataBlock.offset.top + (html.height() / 2));

  var line_length = 0;
  if ((abs(line_angle) < datablock_diagonal_angle) ||
      (abs(line_angle) > (Math.PI - datablock_diagonal_angle)))
  {
    // Line impacts a horizontal face of the datablock
    if (aircraft.dataBlock.offset.top > 12) {
      line_length = (aircraft.dataBlock.offset.top - 12) /
        Math.cos(line_angle);
    }
    else if (aircraft.dataBlock.offset.top <= (-12 - html.height())) {
      line_length = (aircraft.dataBlock.offset.top + html.height() + 12) /
        Math.cos(line_angle);
    }
  }
  else {
    // Line impacts a vertical face of the datablock
    if (aircraft.dataBlock.offset.left > 12) {
      line_length = (aircraft.dataBlock.offset.left - 12) /
        Math.sin(line_angle);
    }
    else if (aircraft.dataBlock.offset.left <= (-12 - html.width())) {
      line_length = (aircraft.dataBlock.offset.left + html.width() + 12) /
        Math.sin(line_angle);
    }
  }

  if (line_length >= 3) {
    cc.save();
    cc.strokeStyle = "rgba(120, 140, 130, 1.0)";
    cc.lineWidth = 1;
    cc.translate(round(km(aircraft.position[0])) + prop.canvas.panX,
                 -round(km(aircraft.position[1])) + prop.canvas.panY);
    cc.beginPath();
    cc.moveTo(sin(line_angle) * 9, cos(line_angle) * 9);
    cc.lineTo(sin(line_angle) * (line_length + 9), cos(line_angle) * (line_length+9));
    cc.stroke();
    cc.restore();
  }
}

function canvas_draw_all_info(cc) {
  for(var i=0;i<prop.aircraft.list.length;i++) {
    cc.save();
    canvas_draw_info(cc, prop.aircraft.list[i]);
    cc.restore();
  }
}

function canvas_draw_compass(cc) {
  cc.translate(round(prop.canvas.size.width/2), round(prop.canvas.size.height/2));
  var size    = 80;
  var size2   = size / 2;
  var padding = 16;

  var dot     = 8;

  cc.translate(-size2-padding, -size2-padding);
  cc.lineWidth = 4;

  cc.fillStyle = "rgba(0, 0, 0, 0.7)";
  cc.beginPath();
  cc.arc(0, 0, size2, 0, Math.PI*2);
  cc.fill();

  cc.fillStyle = "rgba(255, 255, 255, 1.0)";
  cc.beginPath();
  cc.arc(0, 0, dot/2, 0, Math.PI*2);
  cc.fill()

  // Wind direction & speed
  if(airport_get().wind.speed > 8) {
    windspeed_line = airport_get().wind.speed/2;
    highwind = true;
  } else {
    windspeed_line = airport_get().wind.speed;
    highwind = false;
  }
  cc.save();
  cc.translate(-dot/2 * Math.sin(airport_get().wind.angle), dot/2 * Math.cos(airport_get().wind.angle));
  cc.beginPath();
  cc.moveTo(0, 0);
  cc.rotate(airport_get().wind.angle);
  cc.lineTo(0, crange(0, windspeed_line, 15, 0, size2-dot));
  // Color wind sock red for high-wind
  if(highwind) cc.strokeStyle = "rgba(255, 0, 0, 0.7)";
  else cc.strokeStyle = "rgba(255, 255, 255, 0.7)";
  cc.lineWidth = 2;
  cc.stroke();
  cc.restore();

  cc.fillStyle = "rgba(255, 255, 255, 0.7)";

  cc.textAlign = "center";
  cc.textBaseline = "top";
  for(var i=0;i<4;i++) {
    var angle = (i / 4) * 360;
    cc.save();
    cc.rotate((i / 4) * (Math.PI * 2));
    cc.fillText(angle, 0, -size2+6);
    cc.restore();
  }

}

function canvas_draw_ctr(cc) {
  cc.translate(round(prop.canvas.size.width/2), round(prop.canvas.size.height/2));
  cc.translate(prop.canvas.panX, prop.canvas.panY);
  cc.fillStyle = "rgba(200, 255, 200, 0.02)";
  cc.beginPath();
  cc.arc(0, 0, airport_get().ctr_radius*prop.ui.scale, 0, Math.PI*2);
  cc.fill();

  cc.beginPath();
  cc.arc(0, 0, airport_get().ctr_radius*prop.ui.scale, 0, Math.PI*2);
  cc.linewidth = 1;
  cc.strokeStyle = "rgba(200, 255, 200, 0.25)";
  cc.stroke();

  cc.beginPath();
  cc.arc(0, 0, airport_get().ctr_radius*prop.ui.scale*0.75, 0, Math.PI*2);
  cc.strokeStyle = "rgba(200, 255, 200, 0.1)";
  cc.stroke();

  cc.beginPath();
  cc.arc(0, 0, airport_get().ctr_radius*prop.ui.scale*0.50, 0, Math.PI*2);
  cc.strokeStyle = "rgba(200, 255, 200, 0.1)";
  cc.stroke();

  cc.beginPath();
  cc.arc(0, 0, airport_get().ctr_radius*prop.ui.scale*0.25, 0, Math.PI*2);
  cc.strokeStyle = "rgba(200, 255, 200, 0.1)";
  cc.stroke();

}

function canvas_update_post() {
  var elapsed = game_time() - airport_get().start;
  var alpha   = crange(0.1, elapsed, 0.4, 0, 1);

  var framestep = Math.round(crange(1, prop.game.speedup, 10, 30, 1));

  if(prop.canvas.dirty || (!game_paused() && prop.time.frames % framestep == 0) || elapsed < 1) {
    var cc=canvas_get("navaids");
    var fading  = (elapsed < 1);

    cc.font = "11px monoOne, monospace";

    if(prop.canvas.dirty || fading || true) {
      cc.save();

      canvas_clear(cc);
      cc.translate(round(prop.canvas.size.width/2), round(prop.canvas.size.height/2));

      cc.save();
      cc.globalAlpha = alpha;
      canvas_draw_runways(cc);
      cc.restore();

      cc.save();
      cc.globalAlpha = alpha;
      canvas_draw_fixes(cc);
      cc.restore();

      cc.restore();
    }

    // Controlled traffic region - (CTR)
    cc.save();
    canvas_draw_ctr(cc);
    cc.restore();

    cc.save();
    cc.globalAlpha = alpha;
    cc.translate(round(prop.canvas.size.width/2), round(prop.canvas.size.height/2));
    canvas_draw_runway_labels(cc);
    cc.restore();

    // Compass

    cc.font = "bold 10px monoOne, monospace";

    if(prop.canvas.dirty || fading || true) {
      cc.save();
      cc.translate(round(prop.canvas.size.width/2), round(prop.canvas.size.height/2));
      canvas_draw_compass(cc);
      cc.restore();
    }

    cc.font = "10px monoOne, monospace";

    if(prop.canvas.dirty || canvas_should_draw() || true) {
      cc.save();
      cc.globalAlpha = alpha;
      cc.translate(round(prop.canvas.size.width/2), round(prop.canvas.size.height/2));
      canvas_draw_all_aircraft(cc);
      cc.restore();
    }

    cc.save();
    cc.globalAlpha = alpha;
    cc.translate(round(prop.canvas.size.width/2), round(prop.canvas.size.height/2));
    canvas_draw_all_info(cc);
    cc.restore();

    cc.save();
    cc.globalAlpha = alpha;
    canvas_draw_scale(cc);
    cc.restore();

    prop.canvas.dirty = false;
  }
}
