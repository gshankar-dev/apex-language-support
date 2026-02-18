trigger ZON_GroupTrigger on Group (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    ZON_BaseService_501.ServiceConfig config =
        new ZON_BaseService_501.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            ZON_Domain_508 domain =
                new ZON_Domain_508();
            ZON_Domain_508.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (ZON_Domain_508.ValidationError err : validation.errors) {
                    if (err.severity == ZON_Domain_508.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        ZON_RecordService_503 service =
            new ZON_RecordService_503();
        ZON_BaseService_501.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'ZON trigger error: ' + error);
            }
        }
    }
}
