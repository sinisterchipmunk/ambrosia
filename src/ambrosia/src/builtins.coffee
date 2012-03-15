exports.Builtins =
  descriptor_for: (varname) ->
    # check for builtins, defining it and returning it if found
    if (default_value = this[varname]) != undefined
      type: (if typeof(default_value) == 'string' then 'string' else 'integer')
      value: default_value
    else undefined
  
  # Audio variables
  'audio.any_key'          : 'sound_click_midtone'
  'audio.app_error'        : 'sound_click_midtone'
  'audio.app_start'        : 'sound_click_midtone'
  'audio.app_stop'         : 'sound_click_midtone'
  'audio.barcode_failed'   : 'sound_short_low'
  'audio.barcode_read'     : 'sound_short_high'
  'audio.cancel_key'       : 'sound_click_midtone'
  'audio.clear_key'        : 'sound_click_midtone'
  'audio.connection_close' : 'sound_click_midtone'
  'audio.connection_open'  : 'sound_click_midtone'
  'audio.emv_insert'       : 'sound_click_midtone'
  'audio.emv_remove'       : 'sound_click_midtone'
  'audio.enter_key'        : 'sound_click_midtone'
  'audio.focus_get'        : 'sound_click_midtone'
  'audio.mute'             : 'off'
  'audio.next_ref'         : 'sound_click_midtone'
  'audio.next_url'         : 'sound_click_midtone'
  'audio.paper_feed_key'   : 'sound_click_midtone'
  'audio.swipe'            : 'sound_click_midtone'
  'audio.swipe_failed'     : 'sound_click_low'
  'audio.tml_key_press'    : 'sound_click_midtone'
  'audio.volume'           : 100

  # Card-related variables
  'card.cardholder_name'   : ''
  'card.effective_date'    : ''
  'card.expiry_date'       : ''
  'card.input_type'        : 1
  'card.issue_number'      : 0
  'card.issuer_name'       : ''
  'card.pan'               : ''
  'card.scheme'            : ''

  # Variables used by "icc_emv" parser
  'card.emv.aac'           : ''
  'card.emv.aid'           : ''
  'card.emv.aip'           : 0
  'card.emv.app_pan_seq'   : 0
  'card.emv.arqc'          : ''
  'card.emv.atc'           : 0
  'card.emv.auc'           : 0
  'card.emv.cvmr'          : ''
  'card.emv.iac_default'   : ''
  'card.emv.iac_denial'    : ''
  'card.emv.iac_online'    : ''
  'card.emv.iad'           : ''
  'card.emv.iso_track2'    : ''
  'card.emv.last_attempt'  : 0
  'card.emv.signature'     : 0
  'card.emv.tc'            : ''
  'card.emv.tvr'           : ''
  'card.emv.unumber'       : 0

  # Smart-card PIN-related variables
  'card.pin'               : ''
  'card.pin.length'        : 0
  'card.pin.smid'          : ''
  'card.pin.array'         : 0

  # Variables used by "mag" parser
  'card.mag.iso1_track'    : ''
  'card.mag.iso2_track'    : ''
  'card.mag.iso3_track'    : ''
  'card.mag.service_code'  : ''

  # Card parsers-related variables
  'card.parser.type'          : ''
  'card.parser.reject_reason' : ''
  'card.parser.verdict'       : ''
  'card.parser.cvm'           : ''
  'card.parser.cvr'           : ''

  # Variables for managing card parsers configuration updates
  'cfgm.emv.timestamp'        : 0
  'cfgm.mag.timestamp'        : 0
  'cfgm.scan.interval'        : 1

  # Variables related to the COM connection
  'com.data_size'             : '8'
  'com.name'                  : 'COM1'
  'com.parity'                : 'none'
  'com.speed'                 : '115200'
  'com.stop_bits'             : '1'

  # Error handling variables
  'err.baddata_reason'        : ''
  'err.code.high'             : 0
  'err.code.low'              : 0
  'err.description'           : ''

  # GPRS-related variables
  'gprs.apn'                  : 'internet.msk'
  'gprs.gsm_pin1'             : '0000'
  'gprs.gsm_puk1'             : '00000000'
  'gprs.selection_to'         : 60

  # IP-related variables
  'ip.default_gateway'        : '192.168.0.1'
  'ip.dns1'                   : '0.0.0.0'
  'ip.dns2'                   : '0.0.0.0'
  'ip.local_addr'             : '0.0.0.0'
  'ip.media'                  : 'com'
  'ip.net_conn_timeout'       : 120
  'ip.net_mask'               : '255.255.255.0'
  'ip.persistent'             : 'yes'
  'ip.so_timeout'             : 30
  'ip.static_addr'            : '192.168.0.10'
  'ip.term_ip'                : 'dynamic'

  # Incendo Online MicroBrowser-related variables
  'oebr.appversion'            : '3.2.0'
  'oebr.backlight.off_strength' : 0
  'oebr.backlight.timeout'      : 600
  'oebr.cache_update_policy'    : 'expired'
  'oebr.cache.storage'          : 1024
  'oebr.connection.endstate'    : 'up'
  'oebr.connection.state'       : 'down'
  'oebr.connect.pool_off'       : 'yes'
  'oebr.connect.sync_cache'     : 'yes'
  'oebr.connect.sync_config'    : 'yes'
  'oebr.current_uri'            : ''
  'oebr.econn'                  : 0
  'oebr.indicators'             : 'default'
  'oebr.languages'              : 'english;french;spanish'
  'oebr.last_connection_dt'     : ''
  'oebr.offline.size'           : 0
  'oebr.offline.storage'        : 64
  'oebr.pin_init'               : '100'
  'oebr.post_id'                : 0
  'oebr.posts_number'           : 0
  'oebr.posts_number_tmp'       : 0
  'oebr.posts_print_mode'       : 'header'
  'oebr.prev_screen'            : ''
  'oebr.run_on_reboot'          : 'yes'
  'oebr.run_on_reboot_str'      : 'yes'
  'oebr.start_page'             : '/'
  'oebr.submit_mode'            : 'online'
  'oebr.supervisor_passwd'      : '123'
  'oebr.time_zone'              : '0'
  'oebr.transid'                : 1
  'oebr.unique_id'              : 1
  'oebr.version'                : '3.2.0'

  # Variables related to working with TML logs
  'oebr.log_descr'              : ''
  'oebr.log_id'                 : ''
  'oebr.log_module'             : ''
  'oebr.log_severity'           : ''
  'oebr.log_size'               : 0
  'oebr.log_size_limit'         : 128
  'oebr.ulog_cntr'              : 0

  # Variables related to working with GMA events
  'gma.event.subscribed'        : ''
  'gma.event.occurred'          : 'menu'
  'gma.event.key.pressed'       : ''

  # Variables related to data exchange with third-party applications
  'oebr.3rdparty.app_name'      : 'GB000400_Ima'
  'oebr.3rdparty.timeout'       : 0
  'oebr.3rdparty.var_list' : 'oebr.3rdparty.app_name;oebr.3rdparty.timeout;card.emv.aac;oebr.last_connection_dt'

  # Incendo Online Gateway Variables
  'oegw.certificate'            : ''
  'oegw.init_port'              : 61001
  'oegw.init_resp_timeout'      : 25
  'oegw.ip'                     : '127.0.0.1'
  'oegw.ip.resolved'            : 'unknown'
  'oegw.port'                   : 61000
  'oegw.resp_timeout'           : 25

  # Variables related to payment processing
  'payment.amount'                    : 0
  'payment.amount_other'              : 0
  'payment.auth_code'                 : ''
  'payment.auth_resp_code'            : 0
  'payment.emv.arpc'                  : ''
  'payment.emv.issuer_auth'           : ''
  'payment.emv.issuer_script1'        : ''
  'payment.emv.issuer_script2'        : ''
  'payment.emv.issuer_script_results' : ''
  'payment.merchant_number'           : 0
  'payment.trans_type'                : 'debit'
  'payment.txn_result'                : 0

  # PPP connection variables
  'ppp.authtype'                      : 'PAP'
  'ppp.conn_timeout'                  : 120
  'ppp.login'                         : 'ingenico_oe'
  'ppp.password'                      : '1234567890'
  'ppp.phone'                         : '908450885336'
  'ppp.retries'                       : 3

  # Terminal variables
  'terminal.certificate'              : ''
  'terminal.datetime'                 : ''
  'terminal.datetime_start'           : ''
  'terminal.itid'                     : '100'
  'terminal.model'                    : 'ICT220'
  'terminal.os'                       : '3.2.0'
  'terminal.part_number'              : '12345'
  'terminal.password'                 : ''
  'terminal.pinpad_present'           : 0
  'terminal.privkey'                  : ''
  'terminal.serial_number'            : '12345'
  'terminal.serial_number_default'    : '123456789012'
  'terminal.sn_check'                 : 1

  # Bar code scanner (imager)-related variables
  'imager.aim_id'                     : '1'
  'imager.aim_modifier'               : '2'
  'imager.code_id'                    : '3'
  'imager.data'                       : '12345'

  # Auxiliary variables
  'passwd'                            : '123'
  'screen_after_call'                 : ''
