import { Request, Response } from "express";
import { MSNUtils, getSortaISODate } from "../util";

export default async function FindMembership(req: Request, res: Response) {
	const date = getSortaISODate();
	return res.status(200).send(`<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
	<soap:Header>
		<ServiceHeader xmlns="http://www.msn.com/webservices/AddressBook">
			<Version>15.01.1408.0000</Version>
			<CacheKey>12r1:iAX_-5cZAMYBiZtBq5iO1WhrC_HVMfx65jPtvaCVa-YcW1mZDrhDAZjbQlDMXnWqqq6fNuQ8Q8LCJbnj1LVUDEpsxtkKDOhwwXeHbXDGe4IPyR18ek-aOhH28WfUbR3vCV39yTlnNak8mf5BszNUhwqs_HsFB5Uz5Rsx10OSeLgAOD9Ct26dFjuYsHz3GCRITDCjdmmZhiH7d6YzusCBKB9h-LBiuu92ucpsPQ</CacheKey>
			<CacheKeyChanged>true</CacheKeyChanged>
			<PreferredHostName>m1.escargot.chat</PreferredHostName>
			<SessionId>8bda4309-3e18-426d-9577-50f30974d79b</SessionId>
		</ServiceHeader>
	</soap:Header>
	<soap:Body>
		<FindMembershipResponse xmlns="http://www.msn.com/webservices/AddressBook">
			<FindMembershipResult>
				<Services>
					<Service>
						<Memberships><Membership>
									<MemberRole>Allow</MemberRole>
									<Members><Member xsi:type="PassportMember">
													<MembershipId>Allow/aa1888d5-0df9-4388-b264-8d8befac2421</MembershipId>
													<Type>Passport</Type>
													<State>Accepted</State>
													<Deleted>false</Deleted>
													<LastChanged>2024-02-01T19:14:18Z</LastChanged>
													<JoinedDate>2023-08-21T15:58:33Z</JoinedDate>
													<ExpirationDate>0001-01-01T00:00:00</ExpirationDate>
													<Changes />
													<PassportName>nullptr@escargot.chat</PassportName>
													<IsPassportNameHidden>false</IsPassportNameHidden>
													<PassportId>0</PassportId>
													<CID>2388223847251666098</CID>
													<PassportChanges />
													<LookedupByCID>false</LookedupByCID>
												</Member></Members>
									<MembershipIsComplete>true</MembershipIsComplete>
								</Membership><Membership>
									<MemberRole>Block</MemberRole>
									<Members></Members>
									<MembershipIsComplete>true</MembershipIsComplete>
								</Membership><Membership>
									<MemberRole>Reverse</MemberRole>
									<Members><Member xsi:type="PassportMember">
													<MembershipId>Reverse/aa1888d5-0df9-4388-b264-8d8befac2421</MembershipId>
													<Type>Passport</Type>
													<State>Accepted</State>
													<Deleted>false</Deleted>
													<LastChanged>2024-02-01T19:14:18Z</LastChanged>
													<JoinedDate>2023-08-21T15:58:33Z</JoinedDate>
													<ExpirationDate>0001-01-01T00:00:00</ExpirationDate>
													<Changes />
													<PassportName>nullptr@escargot.chat</PassportName>
													<IsPassportNameHidden>false</IsPassportNameHidden>
													<PassportId>0</PassportId>
													<CID>2388223847251666098</CID>
													<PassportChanges />
													<LookedupByCID>false</LookedupByCID>
												</Member></Members>
									<MembershipIsComplete>true</MembershipIsComplete>
								</Membership><Membership>
								<MemberRole>Pending</MemberRole>
								<Members></Members>
								<MembershipIsComplete>true</MembershipIsComplete>
							</Membership>
						</Memberships>
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
						<LastChange>2024-02-01T19:14:18Z</LastChange>
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
						<CreatorCID>-307206720018089283</CreatorCID>
						<CreatorPassportName>nullptralt@escargot.chat</CreatorPassportName>
						<CircleAttributes>
							<IsPresenceEnabled>false</IsPresenceEnabled>
							<Domain>WindowsLive</Domain>
						</CircleAttributes>
						<MessengerApplicationServiceCreated>false</MessengerApplicationServiceCreated>
					</Info>
					<Changes />
					<CreateDate>2024-02-01T19:14:18Z</CreateDate>
					<LastChange>2024-02-01T19:14:18Z</LastChange>
				</OwnerNamespace>
			</FindMembershipResult>
		</FindMembershipResponse>
	</soap:Body>
</soap:Envelope>`);
}
