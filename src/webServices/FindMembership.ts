import { Request, Response } from "express";
import { MSNUtils, getSortaISODate } from "../util";

export default async function FindMembership(req: Request, res: Response) {
	const date = getSortaISODate();
	return res.status(200).send(`<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
	<soap:Header>
		<ServiceHeader xmlns="http://www.msn.com/webservices/AddressBook">
			<Version>15.01.1408.0000</Version>
			<CacheKey>12r1:kb8nQEcjtvDKrDshQDtkzetsce8qxSHpBYpGlVo9qNNNWeC6WjdraSUUPwBWUw3bfgnhy4qwilhX7htp119_05_Ab4yKr94-PuIEVfbZ4PJehpaPx-P3qMQqDl0Bt3LEW4nk2NsamFDf9SqjoEzDyHhbDJ-HnaGlpFfy8FXn4xIw7Zbr7RMgDq9o1aYNAuV9wILX4F_3y5n1kdMPBock67Z5r4k888-MtN4myQ</CacheKey>
			<CacheKeyChanged>true</CacheKeyChanged>
			<PreferredHostName>localhost</PreferredHostName>
			<SessionId>12cf891e-0629-4155-8c59-45d87e23bf90</SessionId>
		</ServiceHeader>
	</soap:Header>
	<soap:Body>
		<FindMembershipResponse xmlns="http://www.msn.com/webservices/AddressBook">
			<FindMembershipResult>
				<Services>
					<Service>
						<Memberships></Memberships>
						<Info>
							<Handle>
								<Id>1</Id>
								<Type>Messenger</Type>
								<ForeignId />
							</Handle>
							<InverseRequired>false</InverseRequired>
							<AuthorizationCriteria>Everyone</AuthorizationCriteria>
							<IsBot>false</IsBot>
						</Info>
						<Changes />
						<LastChange>${date}</LastChange>
						<Deleted>false</Deleted>
					</Service>
				</Services>
				<OwnerNamespace>
					<Info>
						<Handle>
							<Id>00000000-0000-0000-0000-000000000000</Id>
							<IsPassportNameHidden>false</IsPassportNameHidden>
							<CID>0</CID>
						</Handle>
						<CreatorPuid>0</CreatorPuid>
						<CreatorCID>2388223847251666098</CreatorCID>
						<CreatorPassportName>test@hotmail.com</CreatorPassportName>
						<CircleAttributes>
							<IsPresenceEnabled>false</IsPresenceEnabled>
							<Domain>WindowsLive</Domain>
						</CircleAttributes>
						<MessengerApplicationServiceCreated>false</MessengerApplicationServiceCreated>
					</Info>
					<Changes />
					<CreateDate>${date}</CreateDate>
					<LastChange>${date}</LastChange>
				</OwnerNamespace>
			</FindMembershipResult>
		</FindMembershipResponse>
	</soap:Body>
</soap:Envelope>`);
}
