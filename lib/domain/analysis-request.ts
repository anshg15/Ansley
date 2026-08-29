import type { Anchor } from "./anchor";
import type { LifestylePreference } from "./lifestyle-preference";
import type { PropertyProfile } from "./property";
import type { UserProfile } from "./user-profile";

export interface AnalysisRequest {
    property: PropertyProfile;
    userProfile: UserProfile;
    anchors: Anchor[];
    preferences: LifestylePreference[];
}