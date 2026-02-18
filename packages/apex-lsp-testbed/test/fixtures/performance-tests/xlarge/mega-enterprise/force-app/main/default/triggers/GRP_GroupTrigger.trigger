trigger GRP_GroupTrigger on Group (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    GRP_BaseService_161.ServiceConfig config =
        new GRP_BaseService_161.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            GRP_Domain_168 domain =
                new GRP_Domain_168();
            GRP_Domain_168.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (GRP_Domain_168.ValidationError err : validation.errors) {
                    if (err.severity == GRP_Domain_168.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        GRP_RecordService_163 service =
            new GRP_RecordService_163();
        GRP_BaseService_161.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'GRP trigger error: ' + error);
            }
        }
    }
}
