// This is the card configured inside lovelace
export interface LovelaceWatchdogConfig {
good_text?: string;
good_background_color?: string;
good_text_color?: string;
bad_background_color?: string;
bad_text_color?: string;
bad_text?: string;
error_if_no_update_seconds?: number;
alarm_flash_period?: number;
blink_color?: string;
entity?: string;  //optional binary entity; can be 'on' or 'off'
}
