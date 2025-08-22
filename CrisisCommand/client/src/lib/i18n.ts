import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      'app.title': 'Aegis GH',
      'app.subtitle': 'Ghana Emergency Response',
      'nav.citizen': 'Citizen',
      'nav.dispatcher': 'Dispatcher',

      // Emergency Services
      'emergency.title': 'Emergency Services',
      'emergency.subtitle': 'Tap for immediate emergency response',
      'emergency.location': 'Location',
      'emergency.gps_active': 'GPS Active',
      'emergency.police': 'POLICE',
      'emergency.fire': 'FIRE',
      'emergency.ambulance': 'AMBULANCE',
      'emergency.unified': 'UNIFIED',
      'emergency.silent_mode': 'Silent Emergency Mode',
      'emergency.silent_desc': 'Send location without calling',
      'emergency.silent_sos': 'Silent SOS',

      // Other Services
      'services.other': 'Other Emergency Services',
      'services.nadmo': 'NADMO',
      'services.road_safety': 'Road Safety',

      // Incidents
      'incidents.recent': 'Your Recent Reports',
      'incidents.status.resolved': 'RESOLVED',
      'incidents.status.in_progress': 'IN PROGRESS',
      'incidents.status.new': 'NEW',
      'incidents.eta': 'ETA',

      // Dispatcher
      'dispatcher.active_incidents': 'Active Incidents',
      'dispatcher.urgent': 'Urgent',
      'dispatcher.assign_unit': 'Assign Unit',
      'dispatcher.view_map': 'View Map',
      'dispatcher.dashboard': 'Dashboard',
      'dispatcher.active_incidents_count': 'Active Incidents',
      'dispatcher.response_time': 'Response Time Avg',
      'dispatcher.units_available': 'Units Available',
      'dispatcher.today_total': 'Today\'s Total',

      // Chat
      'chat.title': 'Live Chat',
      'chat.type_message': 'Type your message...',

      // Media Upload
      'media.upload_evidence': 'Upload Evidence',
      'media.drag_drop': 'Drag and drop files here, or click to select',
      'media.photo': 'Photo',
      'media.video': 'Video',
      'media.audio': 'Audio',

      // Emergency Modal
      'emergency_modal.activated': 'Emergency SOS Activated',
      'emergency_modal.help_coming': 'Your location has been sent to emergency services. Help is on the way.',
      'emergency_modal.chat_dispatcher': 'Chat with Dispatcher',
      'emergency_modal.add_evidence': 'Add Photos/Video',

      // Common
      'common.cancel': 'Cancel',
      'common.upload': 'Upload',
      'common.close': 'Close',
      'common.reported_by': 'Reported by',
      'common.service': 'Service',
      'common.location': 'Location',
      'common.ago': 'ago',
      'common.dispatched': 'dispatched',
      'common.minutes': 'minutes'
    }
  },
  tw: {
    translation: {
      // Akan/Twi translations
      'app.title': 'Aegis GH',
      'app.subtitle': 'Ghana Abandenmu Adwo',
      'emergency.title': 'Abandenmu Adwo',
      'emergency.subtitle': 'Ka prɛko ara ma abandenmu adwo',
      'emergency.police': 'POLISIFO',
      'emergency.fire': 'OGYA DUMFO',
      'emergency.ambulance': 'AYARESABEA KAA',
      'emergency.unified': 'BIAKO',
      'incidents.recent': 'Wo Nea Aka Amanneɛ',
      'chat.title': 'Kasamu Fi Seesei',
      'common.location': 'Faako',
    }
  },
  ee: {
    translation: {
      // Ewe translations
      'app.title': 'Aegis GH',
      'app.subtitle': 'Ghana Xaxa Ƒe Dɔwɔwɔ',
      'emergency.title': 'Xaxa Ƒe Dɔwɔnawo',
      'emergency.police': 'KPƆLISIA',
      'emergency.fire': 'DZO TSINU',
      'emergency.ambulance': 'DƆNƆ ƑUTA',
      'emergency.unified': 'ƉEKA',
    }
  },
  ga: {
    translation: {
      // Ga translations
      'app.title': 'Aegis GH',
      'app.subtitle': 'Ghana Emergency Response',
      'emergency.title': 'Emergency Services',
      'emergency.police': 'POLICE',
      'emergency.fire': 'FIRE',
      'emergency.ambulance': 'AMBULANCE',
    }
  },
  dag: {
    translation: {
      // Dagbani translations
      'app.title': 'Aegis GH',
      'app.subtitle': 'Ghana Emergency Response',
      'emergency.title': 'Emergency Services',
      'emergency.police': 'POLICE',
      'emergency.fire': 'FIRE',
      'emergency.ambulance': 'AMBULANCE',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
