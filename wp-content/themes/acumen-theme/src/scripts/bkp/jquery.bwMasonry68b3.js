(function($){

	$.fn.bwMasonry = function(options) {
		var defaults = {
			speed :		300,
			ratio : 	1,
			container :	'ul',
			brick :		'li.brick',
			img :		'.brick-img',
			animate :	false,
			after : 	null
		};
	 	var opts = $.extend(defaults, options);

		return this.each(function(x) {

			// Constants
			var brick_count = 0, cell_count = 0, bricks_size_factor = [];

			// Environment
			var env = { w: 0, h: 0 };
			var block_height = 0;
			var cols = -1, prev_cols = -1, rows = -1;
			var first_run = true;
			var bw = 0;
			var img = { w: 0, h: 0 };
			var position_matrix = [];
			var bricks_coord = [];

			// jQuery Vars
			var $this = $(this);
		    $bricks = $this;
		    $brick = $bricks.find(opts.brick);

		    // $this.css({ 'position': 'relative', 'overflow': 'hidden' });
		    $brick.css({ 'position': 'absolute' });

		    brick_count = $brick.length;
		    cell_count = 0;

		    $brick.each(function (index, brick) {
		        if ($(this).hasClass('brick-double')) {
		            bricks_size_factor.push(2);
		            cell_count += 4;
		        } else {
		            bricks_size_factor.push(1);
		            cell_count += 1;
		        }
		    });

	    	if ( $this.hasClass('highlight-bricks') ) {
		    	$brick.css('opacity', 0.15).filter('.highlight').css('opacity', 1);
		    }

		    set_blocks();

		    first_run = false;
		    resize_and_position_bricks(0);

		    $(window).resize(function () {
		        set_blocks();
		        resize_and_position_bricks(opts.speed);
		    });

			function set_blocks() {

			    //env.w = $(window).width();
			    //env.h = $(window).height();

			    //if (env.w >= 1200) bw = 1200;
			    //else bw = env.w;
			   // $this.width(bw);

			    bw = $this.innerWidth();

			    block_height = env.h - 110;
			    // $this.height(block_height);

				prev_cols = cols
			    //if (bw <= 768) cols = 3;
			    //else if (bw <= 1000) cols = 4;
			    //else cols = 5;

			    cols = 4;

			    if ( first_run ) prev_cols = cols

				if(cell_count % cols == 0){
					rows = cell_count / cols;
				}else{
				    rows = Math.round((cell_count / cols) + 0.5); // round up
				}

		    	img.w = bw / cols;

			    img.h = Math.round((img.w * opts.ratio) - 0.5) - 1; // round down, take off 1px to avoid ugly lines between photos (can't do that for width as we need to fill window)

				if ( first_run || cols != prev_cols ) {
				    // reset matrix
				    position_matrix = [];
				    for (var x = 0; x < cols; x++) {
				        position_matrix[x] = [];
				        for (var y = 0; y < rows + 2; y++) {
				            position_matrix[x].push(-1);
				        }
				    }
			    }
			}

			// Find first empty space in grid
			function is_free_spot(current_x, current_y, brick_index) {

				for (var brick_y = 0; brick_y < bricks_size_factor[brick_index]; brick_y++) {
			        for (var brick_x = 0; brick_x < bricks_size_factor[brick_index]; brick_x++) {
			            if (position_matrix[current_x + brick_x] == undefined) {
			                return false;
			            }
			            if (position_matrix[current_x + brick_x][current_y + brick_y] != -1) {
			                return false;
			            }
			        }
			    }
			    return true;
			}

			// Calculate new brick coordinates
			function place_brick_in_matrix(current_x,current_y,brick_index){

				if ( is_free_spot(current_x,current_y,brick_index) ){
					for(var brick_y=0; brick_y<bricks_size_factor[brick_index]; brick_y++){
						for(var brick_x=0; brick_x<bricks_size_factor[brick_index]; brick_x++){
							position_matrix[current_x+brick_x][current_y+brick_y] = brick_index;
						}
					}
					bricks_coord[brick_index] = { x: current_x, y: current_y};
					return true;
				}else{
					return false;
				}
			}

			// Called for each brick if number of cols has changed; calculate new brick position
			function resize_and_position_single_brick(brick_index){
				$brick_single = $brick.eq(brick_index);

				var positioned = false;
				var current_y=0;
				var current_x=0;

				while( !positioned && current_y < rows+2 )
				{
					current_x=0;

					while( !positioned && current_x < cols )
					{
						if(place_brick_in_matrix(current_x,current_y,brick_index))
						{
							position_single_brick($brick_single, current_x * img.w, current_y * img.h, true);
							positioned = true;
						}

						current_x++;
					}

					current_y++;
				}

				if (!positioned) {
					$brick_single.hide();
				}
			}

			// If number of cols has not changed just resize the images, otherwise recalculate brick layout
			function resize_and_position_bricks () {
				$brick.each(function(brick_index,brick){
					if(prev_cols == cols){
						if (bricks_coord[brick_index] != undefined){
							position_single_brick($(brick), bricks_coord[brick_index].x * img.w, bricks_coord[brick_index].y * img.h, false);
						}else{
							resize_and_position_single_brick(brick_index);
						}
					}else{
						resize_and_position_single_brick(brick_index);
					}
				});

				// find out wrapper height

				var max_brick_y = 0;
				var current_brick_max_y = 0;

				$brick.each(function(brick_index,brick){
					if ( typeof bricks_coord[brick_index] !== 'undefined' ){

						current_brick_max_y = bricks_coord[brick_index].y + bricks_size_factor[brick_index] - 1;

						if ( max_brick_y < current_brick_max_y ) {
							max_brick_y = current_brick_max_y;
						}
					}
				});

				var bricks_height = (max_brick_y + 1) * img.h;

				$this.height(bricks_height);

				if ( opts.after != null ) opts.after.call();
			}

			// Place brick at coordinates, load image if within visible frame
			function position_single_brick($brick_single, left, top, relayout) {
				if ( opts.animate && !first_run && relayout ) $brick_single.animate({ 'left': left, 'top': top }, opts.speed);
				else $brick_single.css({ 'left': left, 'top': top });

				$brick_single.data('brick-position', { x : left, y : top });

				return;

				var $img = $brick_single.find('img'+opts.img);

				// if ( top <= block_height && $img.attr('src') == "" ) {
				// 	$img.attr('src', $img.attr('data-src')).imagesLoaded(function() {
				// 		$img.fadeIn().css('display', 'block').parents('li').show();
				// 	});
				// } else if ( top <= block_height ) {
				// 	$img.filter(':hidden').fadeIn().css('display', 'block').parents('li').show();
				// } else {
				// 	$img.hide().parents('li').hide();
				// }

				if ( $img.attr('src') == "" ) {
					$img.attr('src', $img.attr('data-src')).imagesLoaded(function() {
						$img.fadeIn().css('display', 'block').parents('li').show();
					});
				}

			}

		});



	}

})(jQuery);
