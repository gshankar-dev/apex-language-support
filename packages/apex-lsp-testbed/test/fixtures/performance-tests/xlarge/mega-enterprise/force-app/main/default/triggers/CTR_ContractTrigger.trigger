trigger CTR_ContractTrigger on Contract (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    CTR_BaseService_91.ServiceConfig config =
        new CTR_BaseService_91.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            CTR_Domain_98 domain =
                new CTR_Domain_98();
            CTR_Domain_98.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (CTR_Domain_98.ValidationError err : validation.errors) {
                    if (err.severity == CTR_Domain_98.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        CTR_RecordService_93 service =
            new CTR_RecordService_93();
        CTR_BaseService_91.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'CTR trigger error: ' + error);
            }
        }
    }
}
