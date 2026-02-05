import type { NamedMapIcon } from "@packages/data/dist/map-icons";
import type { Team } from "@packages/foxhole-api";

export enum AddType {
	Image = 'image',
	Document = 'document',
	Icon = 'icon',
}

export type Payload = {
	type: AddType.Image;
} | {
	type: AddType.Document;
} | {
	type: AddType.Icon;
	iconType: NamedMapIcon;
	iconTeam: Team;
};
