(function($)
 {
    var focusFn = function()
      {
         var $this = $(this);
         if ($this.hasClass($.fn.formHints.settings.hintClass))
             $this.val('').removeClass($.fn.formHints.settings.hintClass);
      }
    var blurFn = function()
      {
         var $this = $(this);
         if ($this.val() === '')
             $this.addClass($.fn.formHints.settings.hintClass).val($this.attr('title'));
      }
      
    $.fn.extend({
        formHints: function(options)
            {
                var settings = $.fn.formHints.settings;
                
                var $inputs = this;
                
                var clearHints = function()
                     {
                        $inputs.filter('.' + settings.hintClass).val('').removeClass(settings.hintClass);
                     }
                
                $('form').submit(clearHints);
                $(window).unload(clearHints);
                
                return this.each(function()
                    {
                        var $this = $(this);
                        
                        if ($this.val() === '')
                            $this.addClass(settings.hintClass).val($this.attr('title'));
                        
                        $this.focus(focusFn).blur(blurFn);
                        jQuery(window).unload(blurFn); // handles Firefox's autocomplete
                    });
            },
        unFormHints: function(options)
            {
                var settings = $.fn.formHints.settings;
                return this.unbind('focus', focusFn).unbind('blur', blurFn).filter('.' + settings.hintClass).val('').removeClass(settings.hintClass);
            }
    });
    
    $.fn.formHints.settings = {
            hintClass: 'form-input-hint'
        }
 })(jQuery);