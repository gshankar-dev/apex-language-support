trigger VFX_CaseTrigger on Case (
    before insert, before update, before delete,
    after insert, after update, after delete, after undelete
) {
    VFX_BaseService_721.ServiceConfig config =
        new VFX_BaseService_721.ServiceConfig()
            .withCaching(true)
            .withBatchSize(200);

    if (Trigger.isBefore) {
        if (Trigger.isInsert || Trigger.isUpdate) {
            VFX_Domain_728 domain =
                new VFX_Domain_728();
            VFX_Domain_728.DomainResult validation =
                domain.validate(Trigger.new, Trigger.oldMap);

            if (!validation.isValid) {
                for (VFX_Domain_728.ValidationError err : validation.errors) {
                    if (err.severity == VFX_Domain_728.ValidationSeverity.ERROR_SEVERITY) {
                        Trigger.new[0].addError(err.fieldName + ': ' + err.message);
                    }
                }
            }
        }
    }

    if (Trigger.isAfter) {
        VFX_RecordService_723 service =
            new VFX_RecordService_723();
        VFX_BaseService_721.ServiceResult result =
            service.execute(Trigger.new, config);

        if (!result.success) {
            for (String error : result.errors) {
                System.debug(LoggingLevel.ERROR, 'VFX trigger error: ' + error);
            }
        }
    }
}
