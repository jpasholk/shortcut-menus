import { Home, Mail, Settings, Bell, AArrowDown } from 'lucide-astro'

export interface IconDefinition {
    name: string;
    component: (_props: any) => any;
}

export const icons: IconDefinition[] = [
    { name: 'home', component: Home },
    { name: 'mail', component: Mail },
    { name: 'settings', component: Settings },
    { name: 'bell', component: Bell },
    { name: 'a-arrow-down', component: AArrowDown }
];