trigger CMP_CampaignTrigger on Campaign (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    CMP_BaseService_81.ServiceConfig config =
        new CMP_BaseService_81.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            CMP_Domain_88 domain =
                new CMP_Domain_88();
            CMP_Domain_88.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (CMP_Domain_88.ValidationError err : validation.errors) {
                    if (err.severity == CMP_Domain_88.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        CMP_RecordService_83 service =
            new CMP_RecordService_83();
        CMP_BaseService_81.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'CMP trigger error: ' + error);
            }
        }
    }
}
